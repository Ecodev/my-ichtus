import { Component, OnInit } from '@angular/core';
import { CreateUser, CreateUserVariables, UpdateUser, UpdateUserVariables, User, UserVariables } from '../../../shared/generated-types';
import { ActivatedRoute, Router } from '@angular/router';
import { BookableService } from '../../../admin/bookables/services/bookable.service';
import { AnonymousUserService } from './anonymous-user.service';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { NaturalAbstractDetail, NaturalAlertService, NaturalDataSource } from '@ecodev/natural';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent extends NaturalAbstractDetail<User['user'],
    UserVariables,
    CreateUser['createUser'],
    CreateUserVariables,
    UpdateUser['updateUser'],
    UpdateUserVariables,
    any> implements OnInit {

    public mandatoryBookables: NaturalDataSource;

    public step;
    public sending = false;

    constructor(userService: AnonymousUserService,
                alertService: NaturalAlertService,
                router: Router,
                route: ActivatedRoute,
                protected bookableService: BookableService,
                protected apollo: Apollo,
    ) {
        super('user', userService, alertService, router, route);
    }

    ngOnInit() {

        this.step = +this.route.snapshot.data.step;

        super.ngOnInit();

        const email = this.form.get('email');
        if (email && this.step === 1) {
            email.setValue(this.route.snapshot.params.email);
        }

        this.bookableService.getMandatoryBookables().subscribe(bookables => {
            if (bookables) {
                this.mandatoryBookables = new NaturalDataSource(bookables);
            }
        });

    }

    public submit(): void {
        NaturalAbstractDetail.validateAllFormFields(this.form);

        if (this.form.invalid) {
            return;
        }

        this.doSubmit();
    }

    /**
     * Register new user
     */
    protected doSubmit(): void {
        this.sending = true;
        const mutation = gql`
            mutation Register($email: Email!, $hasInsurance: Boolean!, $termsAgreement: Boolean!) {
                register(email: $email, hasInsurance: $hasInsurance, termsAgreement: $termsAgreement)
            }
        `;

        this.apollo.mutate({
            mutation: mutation,
            variables: this.form.value,
        }).subscribe(() => {
            this.sending = false;

            const message = 'Un email avec des instructions a été envoyé';

            this.alertService.info(message, 5000);
            this.router.navigate(['/login']);
        }, () => this.sending = false);
    }
}
