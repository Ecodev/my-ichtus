import {gql, Apollo} from 'apollo-angular';
import {Component, Injector, OnInit} from '@angular/core';
import {
    CreateUser,
    CreateUserVariables,
    UpdateUser,
    UpdateUserVariables,
    User,
    UserVariables,
} from '../../../shared/generated-types';
import {BookableService} from '../../../admin/bookables/services/bookable.service';
import {AnonymousUserService} from './anonymous-user.service';
import {ifValid, NaturalAbstractDetail, NaturalDataSource, validateAllFormControls} from '@ecodev/natural';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent
    extends NaturalAbstractDetail<
        User['user'],
        UserVariables,
        CreateUser['createUser'],
        CreateUserVariables,
        UpdateUser['updateUser'],
        UpdateUserVariables,
        never,
        never
    >
    implements OnInit {
    public mandatoryBookables: NaturalDataSource;

    public step;
    public sending = false;

    constructor(
        userService: AnonymousUserService,
        injector: Injector,
        protected bookableService: BookableService,
        protected apollo: Apollo,
    ) {
        super('user', userService, injector);
    }

    public ngOnInit(): void {
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
        validateAllFormControls(this.form);

        ifValid(this.form).subscribe(() => this.doSubmit());
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

        this.apollo
            .mutate({
                mutation: mutation,
                variables: this.form.value,
            })
            .subscribe(
                () => {
                    const message = 'Un email avec des instructions a été envoyé';

                    this.alertService.info(message, 5000);
                    this.router.navigate(['/login']);
                },
                error => {
                    this.sending = false;
                    this.alertService.error(error.message, 5000);
                },
            );
    }
}
