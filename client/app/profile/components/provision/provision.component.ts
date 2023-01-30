import {Component, Inject, ViewChild} from '@angular/core';
import {ShowOnDirtyErrorStateMatcher} from '@angular/material/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import {UntypedFormControl, Validators} from '@angular/forms';
import {BankingInfosVariables} from '../../../shared/generated-types';
import {BvrComponent} from '../bvr/bvr.component';
import {money} from '@ecodev/natural';

@Component({
    selector: 'app-provision',
    templateUrl: './provision.component.html',
    styleUrls: ['./provision.component.scss'],
})
export class ProvisionComponent {
    /**
     * Minimum payment amount
     * Positive number at the payment is always positive
     */
    public min = 25;
    public formCtrl: UntypedFormControl;
    public matcher = new ShowOnDirtyErrorStateMatcher();
    public bvrData: BankingInfosVariables;

    public paymentMode: 'ebanking' | 'datatrans' | null = null;

    @ViewChild(BvrComponent)
    private bvr!: BvrComponent;

    public constructor(@Inject(MAT_DIALOG_DATA) public readonly data: any) {
        this.bvrData = {
            user: data.user.id,
        };

        // Set the default amount to the user's negative balance, if any
        const initialAmount = data.balance < 0 ? Math.abs(data.balance) : this.min;

        this.formCtrl = new UntypedFormControl(initialAmount, [Validators.min(this.min), money]);
    }

    public setPaymentMode(paymentMode: 'ebanking' | 'datatrans'): void {
        this.paymentMode = paymentMode;
        this.showExportBillButton();
    }

    public showExportBillButton(): boolean {
        return this.paymentMode === 'ebanking' && !!this.bvr?.bankingInfos?.qrCode;
    }

    public exportBill(): void {
        this.bvr.exportBill();
    }
}
