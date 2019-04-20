import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NaturalAbstractDetail } from '@ecodev/natural';
import { NaturalAlertService } from '@ecodev/natural';
import {
    TransactionTag,
    TransactionTagVariables,
    CreateTransactionTag,
    CreateTransactionTagVariables,
    DeleteTransactionTags,
    UpdateTransactionTag,
    UpdateTransactionTagVariables,
} from '../../../shared/generated-types';
import { TransactionTagService } from '../services/transactionTag.service';

@Component({
    selector: 'app-transaction-tag',
    templateUrl: './transactionTag.component.html',
    styleUrls: ['./transactionTag.component.scss'],
})
export class TransactionTagComponent
    extends NaturalAbstractDetail<TransactionTag['transactionTag'],
        TransactionTagVariables,
        CreateTransactionTag['createTransactionTag'],
        CreateTransactionTagVariables,
        UpdateTransactionTag['updateTransactionTag'],
        UpdateTransactionTagVariables,
        DeleteTransactionTags> {


    constructor(alertService: NaturalAlertService,
                transactionTagService: TransactionTagService,
                router: Router,
                route: ActivatedRoute,
    ) {
        super('transactionTag', transactionTagService, alertService, router, route);
    }
}
