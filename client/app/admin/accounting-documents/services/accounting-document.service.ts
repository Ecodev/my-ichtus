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

    public override getDefaultForServer(): AccountingDocumentInput {
        return {
            file: null as unknown as File,
            expenseClaim: null,
            transaction: null,
        };
    }
}
