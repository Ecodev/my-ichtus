import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {createAccountingDocumentMutation, deleteAccountingDocumentMutation} from './accounting-documents.queries';
import {
    AccountingDocumentInput,
    CreateAccountingDocument,
    CreateAccountingDocumentVariables,
    DeleteAccountingDocument,
    DeleteAccountingDocumentVariables,
} from '../../../shared/generated-types';
import {NaturalAbstractModelService, NaturalDebounceService} from '@ecodev/natural';

@Injectable({
    providedIn: 'root',
})
export class AccountingDocumentService extends NaturalAbstractModelService<
    any,
    any,
    any,
    any,
    CreateAccountingDocument['createAccountingDocument'],
    CreateAccountingDocumentVariables,
    any,
    any,
    DeleteAccountingDocument,
    DeleteAccountingDocumentVariables
> {
    public constructor(apollo: Apollo, naturalDebounceService: NaturalDebounceService) {
        super(
            apollo,
            naturalDebounceService,
            'accountingDocument',
            null,
            null,
            createAccountingDocumentMutation,
            null,
            deleteAccountingDocumentMutation,
        );
    }

    protected getDefaultForServer(): AccountingDocumentInput {
        return {
            file: null as unknown as File,
            expenseClaim: null,
            transaction: null,
        };
    }
}
