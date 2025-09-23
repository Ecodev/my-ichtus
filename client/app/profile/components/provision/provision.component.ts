import {Component, inject, viewChild} from '@angular/core';
import {ShowOnDirtyErrorStateMatcher} from '@angular/material/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {BankingInfosVariables, CurrentUserForProfile} from '../../../shared/generated-types';
import {BvrComponent} from '../bvr/bvr.component';
import {money} from '@ecodev/natural';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatButton} from '@angular/material/button';
import {CurrencyPipe} from '@angular/common';

export type ProvisionData = {
    balance: number;
    user: NonNullable<CurrentUserForProfile['viewer']>;
};

@Component({
    selector: 'app-provision',
    imports: [
        MatDialogModule,
        CurrencyPipe,
        MatButton,
        MatFormField,
        MatLabel,
        MatError,
        MatSuffix,
        MatInput,
        FormsModule,
        ReactiveFormsModule,
        BvrComponent,
    ],
    templateUrl: './provision.component.html',
    styleUrl: './provision.component.scss',
})
export class ProvisionComponent {
    public readonly data = inject<ProvisionData>(MAT_DIALOG_DATA);

    /**
     * Minimum payment amount
     * Positive number at the payment is always positive
     */
    public min = 25;
    public formCtrl: FormControl;
    public matcher = new ShowOnDirtyErrorStateMatcher();
    public bvrData: BankingInfosVariables;

    public paymentMode: 'ebanking' | 'datatrans' | null = null;

    private readonly bvr = viewChild(BvrComponent);

    public constructor() {
        const data = this.data;

        this.bvrData = {
            user: data.user.id,
        };

        // Set the default amount to the user's negative balance, if any
        const initialAmount = data.balance < 0 ? Math.abs(data.balance) : this.min;

        this.formCtrl = new FormControl(initialAmount, [Validators.min(this.min), money]);
    }

    public setPaymentMode(paymentMode: 'ebanking' | 'datatrans'): void {
        this.paymentMode = paymentMode;
        this.showExportBillButton();
    }

    public showExportBillButton(): boolean {
        return this.paymentMode === 'ebanking' && !!this.bvr()?.bankingInfos?.qrCode;
    }

    public exportBill(): void {
        this.bvr()?.exportBill();
    }
}
