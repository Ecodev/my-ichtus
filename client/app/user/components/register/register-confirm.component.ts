import {Apollo, gql} from 'apollo-angular';
import {Component, OnInit} from '@angular/core';
import {available, deliverableEmail, NaturalAlertService, relationsToIds} from '@ecodev/natural';
import {pick} from 'lodash-es';
import {RegisterComponent} from './register.component';
import {UntypedFormBuilder, Validators} from '@angular/forms';
import {loginValidator, UserService} from '../../../admin/users/services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UserByTokenResolve} from '../../../admin/users/user';
import {UserByToken_userByToken} from '../../../shared/generated-types';
import {BookableService} from '../../../admin/bookables/services/bookable.service';

@Component({
    selector: 'app-confirm',
    templateUrl: './register.component.html', // Use same template as parent class
    styleUrls: ['./register.component.scss'],
})
export class RegisterConfirmComponent extends RegisterComponent implements OnInit {
    public constructor(
        apollo: Apollo,
        route: ActivatedRoute,
        fb: UntypedFormBuilder,
        router: Router,
        alertService: NaturalAlertService,
        bookableService: BookableService,
        private readonly userService: UserService,
    ) {
        super(apollo, route, fb, router, alertService, bookableService);
        this.step = 2;
    }

    public override ngOnInit(): void {
        this.fetchMandatoryBookables();

        this.route.data.subscribe(data => {
            this.initFormFromModel((data['user'] as UserByTokenResolve)['model']);
        });
    }

    private initFormFromModel(model: UserByToken_userByToken): void {
        this.form = this.fb.group({
            // Lock e-mail, this field must not be changed
            email: [{value: model.email, disabled: true}, [Validators.required, deliverableEmail]],
            login: [
                model.login,
                [Validators.required, loginValidator],
                [available(this.userService.loginAvailable.bind(this), model.id)],
            ],
            password: [''],
            firstName: [model.firstName, [Validators.required, Validators.maxLength(100)]],
            lastName: [model.lastName, [Validators.required, Validators.maxLength(100)]],
            street: [model.street, [Validators.required]],
            postcode: [model.postcode, [Validators.required]],
            locality: [model.locality, [Validators.required]],
            birthday: [model.birthday, [Validators.required]],
            country: [model.country, [Validators.required]],
            mobilePhone: [model.mobilePhone, [Validators.required]],
        });
    }

    /**
     * Confirm user registration
     */
    protected override doSubmit(): void {
        this.sending = true;
        const mutation = gql`
            mutation ConfirmRegistration($token: Token!, $input: ConfirmRegistrationInput!) {
                confirmRegistration(token: $token, input: $input)
            }
        `;

        const fieldWhitelist = [
            'login',
            'password',
            'firstName',
            'lastName',
            'street',
            'postcode',
            'locality',
            'country',
            'birthday',
            'mobilePhone',
        ];

        const input = pick(relationsToIds(this.form.value), fieldWhitelist);
        this.apollo
            .mutate({
                mutation: mutation,
                variables: {
                    token: this.route.snapshot.params.token,
                    input: input,
                },
            })
            .subscribe({
                next: () => {
                    const message = 'Tu peux à présent te connecter avec le login et mot de passe que tu as choisi';

                    this.alertService.info(message, 5000);
                    this.router.navigate(['/login']);
                },
                error: error => {
                    this.sending = false;
                    this.alertService.error(error.message, 5000);
                },
            });
    }
}
