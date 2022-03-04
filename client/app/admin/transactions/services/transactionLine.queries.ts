import {gql} from '@apollo/client/core';
import {permissionsFragment, userMetaFragment} from '../../../shared/queries/fragments';

export const transactionLineMetaFragment = gql`
    fragment TransactionLineMeta on TransactionLine {
        id
        name
        balance
        credit {
            id
            name
            type
        }
        debit {
            id
            name
            type
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
        }
    }
`;

export const transactionLinesQuery = gql`
    query TransactionLines(
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
    query TransactionLine($id: TransactionLineID!) {
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
