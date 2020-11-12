import {Apollo, gql} from 'apollo-angular';
import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NaturalAlertService} from '@ecodev/natural';
import {FormGroup} from '@angular/forms';
import {finalize} from 'rxjs/operators';
import {UpdatePassword, UpdatePasswordVariables} from '../../../shared/generated-types';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
    private readonly token: string;
    public readonly form: FormGroup;
    public sending = false;

    constructor(
        route: ActivatedRoute,
        private apollo: Apollo,
        private alertService: NaturalAlertService,
        private router: Router,
    ) {
        this.token = route.snapshot.params.token;
        this.form = new FormGroup({});
    }

    public submit(): void {
        this.sending = true;
        const mutation = gql`
            mutation UpdatePassword($token: Token!, $password: Password!) {
                updatePassword(token: $token, password: $password)
            }
        `;

        this.apollo
            .mutate<UpdatePassword, UpdatePasswordVariables>({
                mutation: mutation,
                variables: {
                    token: this.token,
                    password: this.form.value.password,
                },
            })
            .pipe(finalize(() => (this.sending = false)))
            .subscribe(result => {
                if (result.data!.updatePassword) {
                    this.alertService.info('Le mot de passe a été mis à jour', 5000);
                    this.router.navigate(['/login']);
                } else {
                    const message =
                        'Le token utilisé est invalide. Il est probablement expiré. Faites une nouvelle demande de modification.';
                    this.alertService.error(message, 5000);
                    this.router.navigate(['/user/request-password-reset']);
                }
            });
    }
}
