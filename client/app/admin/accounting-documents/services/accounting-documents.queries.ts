import {gql} from 'apollo-angular';
import {userMetaFragment} from '../../../shared/queries/fragments';

export const createAccountingDocumentMutation = gql`
    mutation CreateAccountingDocument($input: AccountingDocumentInput!) {
        createAccountingDocument(input: $input) {
            id
            mime
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
