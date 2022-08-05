import {Apollo, gql} from 'apollo-angular';
import {Component, OnInit} from '@angular/core';
import {
    deliverableEmail,
    ifValid,
    NaturalAlertService,
    NaturalDataSource,
    validateAllFormControls,
} from '@ecodev/natural';
import {Bookables_bookables} from '../../../shared/generated-types';
import {ActivatedRoute, Router} from '@angular/router';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {BookableService} from '../../../admin/bookables/services/bookable.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
    public mandatoryBookables: NaturalDataSource<Bookables_bookables> | null = null;

    public step: 1 | 2 = 1;
    public sending = false;
    public form!: UntypedFormGroup;

    public constructor(
        protected readonly apollo: Apollo,
        protected readonly route: ActivatedRoute,
        protected readonly fb: UntypedFormBuilder,
        protected readonly router: Router,
        protected readonly alertService: NaturalAlertService,
        protected readonly bookableService: BookableService,
    ) {}

    public ngOnInit(): void {
        this.fetchMandatoryBookables();
        this.initForm();
    }

    protected fetchMandatoryBookables(): void {
        this.bookableService.getMandatoryBookables().subscribe(bookables => {
            if (bookables) {
                this.mandatoryBookables = new NaturalDataSource(bookables);
            }
        });
    }

    private initForm(): void {
        this.form = this.fb.group({
            email: [this.route.snapshot.params.email, [Validators.required, deliverableEmail]],
            termsAgreement: [false, []],
            hasInsurance: [false, []],
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
            .subscribe({
                next: () => {
                    const message = 'Un email avec des instructions a été envoyé';

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
