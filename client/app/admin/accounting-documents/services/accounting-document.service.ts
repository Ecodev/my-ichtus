import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';

import { createAccountingDocumentMutation, deleteAccountingDocumentMutation } from './accounting-documents.queries';
import {
    AccountingDocumentInput,
    CreateAccountingDocument,
    CreateAccountingDocumentVariables,
    DeleteAccountingDocument,
} from '../../../shared/generated-types';
import { NaturalAbstractModelService } from '@ecodev/natural';

@Injectable({
    providedIn: 'root',
})
export class AccountingDocumentService extends NaturalAbstractModelService<any,
    any,
    any,
    any,
    CreateAccountingDocument['createAccountingDocument'],
    CreateAccountingDocumentVariables,
    any,
    any,
    DeleteAccountingDocument> {

    constructor(apollo: Apollo) {
        super(apollo,
            'image',
            null,
            null,
            createAccountingDocumentMutation,
            null,
            deleteAccountingDocumentMutation);
    }

    protected getDefaultForServer(): AccountingDocumentInput {
        return {
            file: '',
            expenseClaim: null,
            transaction: null,
        };
    }

}
