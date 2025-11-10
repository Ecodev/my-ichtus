import {Apollo, gql} from 'apollo-angular';
import {Component, inject, OnInit} from '@angular/core';
import {
    deliverableEmail,
    ifValid,
    NaturalAlertService,
    NaturalDataSource,
    NaturalIconDirective,
    validateAllFormControls,
} from '@ecodev/natural';
import {Bookables, Register, RegisterVariables} from '../../../shared/generated-types';
import {ActivatedRoute, Router} from '@angular/router';
import {FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {BookableService} from '../../../admin/bookables/services/bookable.service';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatFooterCell,
    MatFooterCellDef,
    MatFooterRow,
    MatFooterRowDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
} from '@angular/material/table';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {AddressComponent} from '../../../shared/components/address/address.component';
import {PasswordComponent} from '../password/password.component';
import {MatDivider} from '@angular/material/divider';
import {CurrencyPipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel, MatPrefix, MatSuffix} from '@angular/material/form-field';
import {privacyPolicyUrl} from '../../../login/login.component';

@Component({
    selector: 'app-register',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatError,
        MatPrefix,
        MatSuffix,
        MatInput,
        MatIcon,
        NaturalIconDirective,
        CurrencyPipe,
        MatDivider,
        PasswordComponent,
        AddressComponent,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        MatTable,
        MatHeaderCellDef,
        MatHeaderRowDef,
        MatColumnDef,
        MatCellDef,
        MatRowDef,
        MatFooterCellDef,
        MatFooterRowDef,
        MatHeaderCell,
        MatCell,
        MatFooterCell,
        MatHeaderRow,
        MatRow,
        MatFooterRow,
        MatCheckbox,
        MatButton,
    ],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
    protected readonly apollo = inject(Apollo);
    protected readonly route = inject(ActivatedRoute);
    protected readonly fb = inject(NonNullableFormBuilder);
    protected readonly router = inject(Router);
    protected readonly alertService = inject(NaturalAlertService);
    protected readonly bookableService = inject(BookableService);
    protected readonly privacyPolicyUrl = privacyPolicyUrl;

    public mandatoryBookables: NaturalDataSource<Bookables['bookables']> | null = null;

    public step: 1 | 2 = 1;
    public sending = false;
    public form!: FormGroup;

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
            privacyPolicyAgreement: [false, []],
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
