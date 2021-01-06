import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {ShowOnDirtyErrorStateMatcher} from '@angular/material/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormControl, Validators} from '@angular/forms';
import {BankingInfosVariables} from '../../../shared/generated-types';
import {BvrComponent} from '../bvr/bvr.component';

@Component({
    selector: 'app-provision',
    templateUrl: './provision.component.html',
    styleUrls: ['./provision.component.scss'],
})
export class ProvisionComponent implements OnInit {
    /**
     * Minimum payment amount
     * Positive number at the payment is always positive
     */
    public min = 25;
    public defaultValue = this.min;
    public formCtrl: FormControl;
    public matcher = new ShowOnDirtyErrorStateMatcher();
    public bvrData: BankingInfosVariables;

    public paymentMode;

    @ViewChild(BvrComponent)
    private bvr: BvrComponent;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        this.bvrData = {
            user: data.user.id,
        };

        this.formCtrl = new FormControl(data.balance < 0 ? Math.abs(data.balance) : this.min, [
            Validators.min(this.min),
        ]);
    }

    public ngOnInit(): void {}

    public setPaymentMode(paymentMode: string): void {
        this.paymentMode = paymentMode;
        this.showExportBillButton();
    }

    public showExportBillButton(): boolean {
        return (
            this.paymentMode === 'ebanking' &&
            this.bvr !== undefined &&
            this.bvr.bankingInfos !== undefined &&
            this.bvr.bankingInfos.qrCode !== null
        );
    }

    public exportBill(): void {
        this.bvr.exportBill();
    }
}
