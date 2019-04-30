import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, ShowOnDirtyErrorStateMatcher } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { BankingInfosVariables } from '../../../shared/generated-types';

@Component({
    selector: 'app-provision',
    templateUrl: './provision.component.html',
    styleUrls: ['./provision.component.scss'],
})
export class ProvisionComponent implements OnInit {

    public min = 25;
    public defaultValue = this.min;
    public formCtrl: FormControl;
    public matcher = new ShowOnDirtyErrorStateMatcher();
    public bvrData: BankingInfosVariables;

    public paymentMode;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {

        if (data.balance < 0) {
            this.min = Math.abs(data.balance);
        }

        this.bvrData = {
            user: data.user.id,
        };

        this.formCtrl = new FormControl(Math.max(this.min, this.defaultValue), [Validators.min(this.min)]);

    }

    ngOnInit() {
    }

}
