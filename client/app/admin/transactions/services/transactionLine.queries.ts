import {gql} from '@apollo/client/core';
import {permissionsFragment, userMetaFragment} from '../../../shared/queries/fragments';
import {minimalAccountFragment} from '../../accounts/services/account.queries';

export const transactionLineMetaFragment = gql`
    fragment TransactionLineMeta on TransactionLine {
        id
        name
        balance
        credit {
            ...MinimalAccount
        }
        debit {
            ...MinimalAccount
        }
        bookable {
            id
            name
            code
        }
        remarks
        isReconciled
        transaction {
            id
            expenseClaim {
                id
                accountingDocuments {
                    id
                }
            }
            accountingDocuments {
                id
            }
        }
        transactionDate
        transactionTag {
            id
            name
            color
        }
    }
    ${minimalAccountFragment}
`;

export const transactionLinesQuery = gql`
    query TransactionLinesQuery(
        $filter: TransactionLineFilter
        $sorting: [TransactionLineSorting!]
        $pagination: PaginationInput
    ) {
        transactionLines(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                ...TransactionLineMeta
            }
            pageSize
            pageIndex
            length
            totalBalance
        }
    }
    ${transactionLineMetaFragment}
`;

export const transactionLineQuery = gql`
    query TransactionLineQuery($id: TransactionLineID!) {
        transactionLine(id: $id) {
            id
            ...TransactionLineMeta
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
    ${transactionLineMetaFragment}
    ${userMetaFragment}
    ${permissionsFragment}
`;

export const exportTransactionLines = gql`
    mutation ExportTransactionLines($filter: TransactionLineFilter, $sorting: [TransactionLineSorting!]) {
        exportTransactionLines(filter: $filter, sorting: $sorting)
    }
`;

export const reconcileTransactionLine = gql`
    mutation ReconcileTransactionLine($id: TransactionLineID!, $isReconciled: Boolean!) {
        reconcileTransactionLine(id: $id, isReconciled: $isReconciled) {
            id
            isReconciled
        }
    }
`;
