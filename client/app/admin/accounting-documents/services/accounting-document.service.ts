import {Injectable} from '@angular/core';
import {createAccountingDocumentMutation, deleteAccountingDocumentMutation} from './accounting-documents.queries';
import {
    type AccountingDocumentInput,
    type CreateAccountingDocument,
    type CreateAccountingDocumentVariables,
    type DeleteAccountingDocument,
    type DeleteAccountingDocumentVariables,
} from '../../../shared/generated-types';
import {NaturalAbstractModelService} from '@ecodev/natural';

@Injectable({
    providedIn: 'root',
})
export class AccountingDocumentService extends NaturalAbstractModelService<
    never,
    never,
    never,
    never,
    CreateAccountingDocument['createAccountingDocument'],
    CreateAccountingDocumentVariables,
    never,
    never,
    DeleteAccountingDocument,
    DeleteAccountingDocumentVariables
> {
    public constructor() {
        super(
            'accountingDocument',
            null,
            null,
            createAccountingDocumentMutation,
            null,
            deleteAccountingDocumentMutation,
        );
    }

    public override getDefaultForServer(): AccountingDocumentInput {
        return {
            file: null as unknown as File,
            expenseClaim: null,
            transaction: null,
        };
    }
}
