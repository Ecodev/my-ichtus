import { Component, OnInit } from '@angular/core';
import { NaturalAlertService } from '@ecodev/natural';
import { ActivatedRoute, Router } from '@angular/router';
import { BookableService } from '../../../admin/bookables/services/bookable.service';
import { RegisterComponent } from './register.component';
import { NewUserService } from './new-user.service';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { pick } from 'lodash';
import { NaturalUtility } from '@ecodev/natural';

@Component({
    selector: 'app-confirm',
    templateUrl: './register.component.html', // Use same template as parent class
    styleUrls: ['./register.component.scss'],
})
export class RegisterConfirmComponent extends RegisterComponent implements OnInit {

    constructor(userService: NewUserService,
                router: Router,
                route: ActivatedRoute,
                bookableService: BookableService,
                apollo: Apollo,
                alertService: NaturalAlertService,
    ) {
        super(userService, alertService, router, route, bookableService, apollo);
    }

    protected initForm(): void {
        super.initForm();

        // Lock e-mail, this field must not be changed
        const email = this.form.get('email');
        if (email) {
            email.disable();
        }
    }

    /**
     * Confirm user registration
     */
    protected doSubmit(): void {
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
        ];

        const input = pick(NaturalUtility.relationsToIds(this.form.value), fieldWhitelist);
        this.apollo.mutate({
            mutation: mutation,
            variables: {
                token: this.route.snapshot.params.token,
                input: input,
            },
        }).subscribe(() => {
            this.sending = false;

            const message = 'Vous pouvez maintenant vous connecter avec le login et mot de passe que vous avez choisi';

            this.alertService.info(message, 5000);
            this.router.navigate(['/login']);
        },
        (error) => {
            this.sending = false;
            this.alertService.error(error.message, 5000);
        });
    }

}
