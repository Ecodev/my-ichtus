import gql from 'graphql-tag';
import { permissionsFragment, userMetaFragment } from '../../../shared/queries/fragments';

export const transactionLineMetaFragment = gql`
    fragment transactionLineMeta on TransactionLine {
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
        bookable{
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
    query TransactionLines($filter: TransactionLineFilter, $sorting: [TransactionLineSorting!], $pagination: PaginationInput) {
        transactionLines(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                ...transactionLineMeta
            }
            pageSize
            pageIndex
            length
            totalBalance
        }
    }
${transactionLineMetaFragment}`;

export const transactionLineQuery = gql`
    query TransactionLine($id: TransactionLineID!) {
        transactionLine(id: $id) {
            id
            ...transactionLineMeta
            creationDate
            creator {
                ...userMeta
            }
            updateDate
            updater {
                ...userMeta
            }
            permissions {
                ...permissions
            }
        }
    }
    ${transactionLineMetaFragment}
    ${userMetaFragment}
    ${permissionsFragment}
`;

export const transactionLinesForExportQuery = gql`
    query TransactionLines($filter: TransactionLineFilter, $sorting: [TransactionLineSorting!], $pagination: PaginationInput) {
        transactionLines(filter: $filter, sorting: $sorting, pagination: $pagination) {
            excelExport
        }
    }
`;
