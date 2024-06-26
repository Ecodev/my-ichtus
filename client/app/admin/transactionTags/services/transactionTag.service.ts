import {Injectable} from '@angular/core';
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
    never,
    never
> {
    public constructor() {
        super(
            'transactionTag',
            transactionTagQuery,
            transactionTagsQuery,
            createTransactionTag,
            updateTransactionTag,
            deleteTransactionTags,
        );
    }

    public override getDefaultForServer(): TransactionTagInput {
        return {
            name: '',
            color: '',
        };
    }

    public override getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
        };
    }
}
