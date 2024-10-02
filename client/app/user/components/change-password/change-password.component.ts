import {Apollo, gql} from 'apollo-angular';
import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ifValid, NaturalAlertService, NaturalIconDirective} from '@ecodev/natural';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {finalize} from 'rxjs/operators';
import {UpdatePassword, UpdatePasswordVariables} from '../../../shared/generated-types';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {PasswordComponent} from '../password/password.component';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrl: './change-password.component.scss',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        PasswordComponent,
        MatButtonModule,
        MatIconModule,
        NaturalIconDirective,
    ],
})
export class ChangePasswordComponent {
    private readonly token: string;
    public readonly form = this.fb.group({password: ['']});

    public constructor(
        route: ActivatedRoute,
        private readonly apollo: Apollo,
        private readonly alertService: NaturalAlertService,
        private readonly router: Router,
        private readonly fb: NonNullableFormBuilder,
    ) {
        this.token = route.snapshot.params.token;
    }

    public maybeConfirm(): void {
        ifValid(this.form).subscribe(() => this.submit());
    }

    private submit(): void {
        this.form.disable();
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
                    password: this.form.getRawValue().password,
                },
            })
            .pipe(finalize(() => this.form.enable()))
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
