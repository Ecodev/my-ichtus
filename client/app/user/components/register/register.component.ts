import {Apollo, gql} from 'apollo-angular';
import {Component, Injector, OnInit} from '@angular/core';
import {BookableService} from '../../../admin/bookables/services/bookable.service';
import {AnonymousUserService} from './anonymous-user.service';
import {ifValid, NaturalAbstractDetail, NaturalDataSource, validateAllFormControls} from '@ecodev/natural';
import {Bookables_bookables} from '../../../shared/generated-types';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent extends NaturalAbstractDetail<AnonymousUserService> implements OnInit {
    public mandatoryBookables: NaturalDataSource<Bookables_bookables> | null = null;

    public step: 1 | 2 = 1;
    public sending = false;

    constructor(
        userService: AnonymousUserService,
        injector: Injector,
        protected readonly bookableService: BookableService,
        protected readonly apollo: Apollo,
    ) {
        super('user', userService, injector);
    }

    public ngOnInit(): void {
        this.step = +this.route.snapshot.data.step as 1 | 2;

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
