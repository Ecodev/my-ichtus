import {gql} from '@apollo/client/core';
import {permissionsFragment, userMetaFragment} from '../../../shared/queries/fragments';

export const transactionMetaFragment = gql`
    fragment TransactionMeta on Transaction {
        id
        name
        datatransRef
        transactionDate
        balance
        accountingDocuments {
            id
            mime
        }
        expenseClaim {
            id
            amount
            name
            description
            type
            status
            owner {
                id
                name
            }
            accountingDocuments {
                id
                mime
            }
        }
        remarks
        internalRemarks
    }
`;

export const transactionsQuery = gql`
    query Transactions($filter: TransactionFilter, $sorting: [TransactionSorting!], $pagination: PaginationInput) {
        transactions(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                ...TransactionMeta
            }
            pageSize
            pageIndex
            length
        }
    }
    ${transactionMetaFragment}
`;

export const transactionQuery = gql`
    query Transaction($id: TransactionID!) {
        transaction(id: $id) {
            id
            ...TransactionMeta
            creationDate
            creator {
                ...UserMeta
            }
            updateDate
            updater {
                ...UserMeta
            }
            permissions {
                ...PermissionsRUD
            }
        }
    }
    ${transactionMetaFragment}
    ${userMetaFragment}
    ${permissionsFragment}
`;

export const createTransaction = gql`
    mutation CreateTransaction($input: TransactionInput!, $lines: [TransactionLineInput!]!) {
        createTransaction(input: $input, lines: $lines) {
            id
            creator {
                ...UserMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const updateTransaction = gql`
    mutation UpdateTransaction($id: TransactionID!, $input: TransactionPartialInput!, $lines: [TransactionLineInput!]) {
        updateTransaction(id: $id, input: $input, lines: $lines) {
            id
            balance
            updateDate
            updater {
                ...UserMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const deleteTransactions = gql`
    mutation DeleteTransactions($ids: [TransactionID!]!) {
        deleteTransactions(ids: $ids)
    }
`;
