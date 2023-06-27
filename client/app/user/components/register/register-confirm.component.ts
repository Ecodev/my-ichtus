import {Apollo} from 'apollo-angular';
import {Component, OnInit} from '@angular/core';
import {available, deliverableEmail, NaturalAlertService, relationsToIds, NaturalIconDirective} from '@ecodev/natural';
import {pick} from 'lodash-es';
import {RegisterComponent} from './register.component';
import {UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {loginValidator, UserService} from '../../../admin/users/services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UserByTokenResolve} from '../../../admin/users/user';
import {ConfirmRegistrationVariables, UserByToken} from '../../../shared/generated-types';
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
    selector: 'app-confirm',
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

    private initFormFromModel(model: UserByToken['userByToken']): void {
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
