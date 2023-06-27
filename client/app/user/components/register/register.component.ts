import {Apollo, gql} from 'apollo-angular';
import {Component, OnInit} from '@angular/core';
import {
    deliverableEmail,
    ifValid,
    NaturalAlertService,
    NaturalDataSource,
    validateAllFormControls,
    NaturalIconDirective,
} from '@ecodev/natural';
import {Bookables, Register, RegisterVariables} from '../../../shared/generated-types';
import {ActivatedRoute, Router} from '@angular/router';
import {UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BookableService} from '../../../admin/bookables/services/bookable.service';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule, _MatCheckboxRequiredValidatorModule} from '@angular/material/checkbox';
import {MatTableModule} from '@angular/material/table';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {AddressComponent} from '../../../shared/components/address/address.component';
import {PasswordComponent} from '../password/password.component';
import {MatDividerModule} from '@angular/material/divider';
import {NgIf, CurrencyPipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        FlexModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        NaturalIconDirective,
        NgIf,
        MatDividerModule,
        PasswordComponent,
        AddressComponent,
        MatDatepickerModule,
        MatTableModule,
        MatCheckboxModule,
        _MatCheckboxRequiredValidatorModule,
        MatButtonModule,
        CurrencyPipe,
    ],
})
export class RegisterComponent implements OnInit {
    public mandatoryBookables: NaturalDataSource<Bookables['bookables']> | null = null;

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
            .mutate<Register, RegisterVariables>({
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
