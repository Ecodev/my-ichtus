import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ExpenseClaimInput } from '../../../shared/generated-types';

@Component({
    selector: 'app-create-refund',
    templateUrl: './create-refund.component.html',
    styleUrls: ['./create-refund.component.scss'],
})
export class CreateRefundComponent implements OnInit {

    public expense: ExpenseClaimInput = {
        amount: '',
        name: 'Demande de remboursement',
        description: '',
    };

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
    }

}
