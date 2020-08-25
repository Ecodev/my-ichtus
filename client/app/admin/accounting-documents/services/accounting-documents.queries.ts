import gql from 'graphql-tag';
import {userMetaFragment} from '../../../shared/queries/fragments';

export const createAccountingDocumentMutation = gql`
    mutation CreateAccountingDocument($input: AccountingDocumentInput!) {
        createAccountingDocument(input: $input) {
            id
            creator {
                ...UserMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const deleteAccountingDocumentMutation = gql`
    mutation DeleteAccountingDocument($ids: [AccountingDocumentID!]!) {
        deleteAccountingDocuments(ids: $ids)
    }
`;
