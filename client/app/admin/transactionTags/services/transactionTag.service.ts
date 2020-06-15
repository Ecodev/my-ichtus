import {Injectable} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {FormValidators, NaturalAbstractModelService} from '@ecodev/natural';
import {
    createTransactionTag,
    deleteTransactionTags,
    transactionTagQuery,
    transactionTagsQuery,
    updateTransactionTag,
} from './transactionTag.queries';
import {
    CreateTransactionTag,
    CreateTransactionTagVariables,
    DeleteTransactions,
    DeleteTransactionsVariables,
    TransactionTag,
    TransactionTagInput,
    TransactionTags,
    TransactionTagsVariables,
    TransactionTagVariables,
    UpdateTransactionTag,
    UpdateTransactionTagVariables,
} from '../../../shared/generated-types';
import {Validators} from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class TransactionTagService extends NaturalAbstractModelService<
    TransactionTag['transactionTag'],
    TransactionTagVariables,
    TransactionTags['transactionTags'],
    TransactionTagsVariables,
    CreateTransactionTag['createTransactionTag'],
    CreateTransactionTagVariables,
    UpdateTransactionTag['updateTransactionTag'],
    UpdateTransactionTagVariables,
    any,
    any
> {
    constructor(apollo: Apollo) {
        super(
            apollo,
            'transactionTag',
            transactionTagQuery,
            transactionTagsQuery,
            createTransactionTag,
            updateTransactionTag,
            deleteTransactionTags,
        );
    }

    protected getDefaultForServer(): TransactionTagInput {
        return {
            name: '',
            color: '',
        };
    }

    public getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
        };
    }
}
