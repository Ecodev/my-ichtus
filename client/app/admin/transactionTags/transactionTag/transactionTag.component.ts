import {Component, Injector} from '@angular/core';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {
    CreateTransactionTag,
    CreateTransactionTagVariables,
    DeleteTransactionTags,
    DeleteTransactionTagsVariables,
    TransactionTag,
    TransactionTagVariables,
    UpdateTransactionTag,
    UpdateTransactionTagVariables,
} from '../../../shared/generated-types';
import {TransactionTagService} from '../services/transactionTag.service';

@Component({
    selector: 'app-transaction-tag',
    templateUrl: './transactionTag.component.html',
    styleUrls: ['./transactionTag.component.scss'],
})
export class TransactionTagComponent extends NaturalAbstractDetail<
    TransactionTag['transactionTag'],
    TransactionTagVariables,
    CreateTransactionTag['createTransactionTag'],
    CreateTransactionTagVariables,
    UpdateTransactionTag['updateTransactionTag'],
    UpdateTransactionTagVariables,
    DeleteTransactionTags,
    DeleteTransactionTagsVariables
> {
    constructor(transactionTagService: TransactionTagService, injector: Injector) {
        super('transactionTag', transactionTagService, injector);
    }
}
