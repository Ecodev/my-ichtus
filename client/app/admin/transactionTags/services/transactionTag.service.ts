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
    TransactionTagQuery,
    TransactionTagInput,
    TransactionTagsQuery,
    TransactionTagsQueryVariables,
    TransactionTagQueryVariables,
    UpdateTransactionTag,
    UpdateTransactionTagVariables,
} from '../../../shared/generated-types';
import {Validators} from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class TransactionTagService extends NaturalAbstractModelService<
    TransactionTagQuery['transactionTag'],
    TransactionTagQueryVariables,
    TransactionTagsQuery['transactionTags'],
    TransactionTagsQueryVariables,
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
