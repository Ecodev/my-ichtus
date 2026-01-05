import {NaturalErrorMessagePipe} from '@ecodev/natural';
import {Component, inject, OnInit} from '@angular/core';
import {available, deliverableEmail, NaturalIconDirective, relationsToIds} from '@ecodev/natural';
import {pick} from 'es-toolkit';
import {RegisterComponent} from './register.component';
import {FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {loginValidator, UserService} from '../../../admin/users/services/user.service';
import {UserByTokenResolve} from '../../../admin/users/user';
import {ConfirmRegistrationVariables, UserByTokenQuery} from '../../../shared/generated-types';
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

@Component({
    selector: 'app-confirm',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatError,
        NaturalErrorMessagePipe,
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
export class RegisterConfirmComponent extends RegisterComponent implements OnInit {
    private readonly userService = inject(UserService);

    public constructor() {
        super();
        this.step = 2;
    }

    public override ngOnInit(): void {
        this.fetchMandatoryBookables();

        this.route.data.subscribe(data => {
            this.initFormFromModel(data.user as UserByTokenResolve);
        });
    }

    private initFormFromModel(model: UserByTokenQuery['userByToken']): void {
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

        const input = pick(relationsToIds(this.form.value), fieldWhitelist) as ConfirmRegistrationVariables['input'];
        this.userService
            .confirmRegistration({
                token: this.route.snapshot.params.token,
                input: input,
            })
            .subscribe({
                next: () => this.alertService.info(`Merci d'avoir confirmé ton compte`, 5000),
                error: error => {
                    this.sending = false;
                    this.alertService.error(error.message, 5000);
                },
            });
    }
}
