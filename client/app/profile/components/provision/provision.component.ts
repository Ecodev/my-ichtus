import {Component, Inject, ViewChild} from '@angular/core';
import {ShowOnDirtyErrorStateMatcher} from '@angular/material/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {BankingInfosVariables, CurrentUserForProfile} from '../../../shared/generated-types';
import {BvrComponent} from '../bvr/bvr.component';
import {money} from '@ecodev/natural';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {CommonModule} from '@angular/common';

export type ProvisionData = {
    balance: number;
    user: NonNullable<CurrentUserForProfile['viewer']>;
};

@Component({
    selector: 'app-provision',
    templateUrl: './provision.component.html',
    styleUrls: ['./provision.component.scss'],
    standalone: true,
    imports: [
        MatDialogModule,
        CommonModule,
        FlexModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        BvrComponent,
    ],
})
export class ProvisionComponent {
    /**
     * Minimum payment amount
     * Positive number at the payment is always positive
     */
    public min = 25;
    public formCtrl: FormControl;
    public matcher = new ShowOnDirtyErrorStateMatcher();
    public bvrData: BankingInfosVariables;

    public paymentMode: 'ebanking' | 'datatrans' | null = null;

    @ViewChild(BvrComponent)
    private bvr!: BvrComponent;

    public constructor(@Inject(MAT_DIALOG_DATA) public readonly data: ProvisionData) {
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
        return this.paymentMode === 'ebanking' && !!this.bvr?.bankingInfos?.qrCode;
    }

    public exportBill(): void {
        this.bvr.exportBill();
    }
}
