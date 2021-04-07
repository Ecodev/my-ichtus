import {gql} from 'apollo-angular';
import {permissionsFragment, userMetaFragment} from '../../../shared/queries/fragments';

export const expenseClaimMetaFragment = gql`
    fragment ExpenseClaimMeta on ExpenseClaim {
        id
        name
        description
        remarks
        internalRemarks
        status
        type
        amount
        accountingDocuments {
            id
            mime
        }
        owner {
            id
            name
            email
            account {
                id
                name
            }
        }
        permissions {
            ...PermissionsRUD
        }
        creationDate
        updateDate
    }
    ${permissionsFragment}
`;

export const expenseClaimsQuery = gql`
    query ExpenseClaims($filter: ExpenseClaimFilter, $sorting: [ExpenseClaimSorting!], $pagination: PaginationInput) {
        expenseClaims(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                ...ExpenseClaimMeta
            }
            pageSize
            pageIndex
            length
        }
    }
    ${expenseClaimMetaFragment}
`;

export const expenseClaimQuery = gql`
    query ExpenseClaim($id: ExpenseClaimID!) {
        expenseClaim(id: $id) {
            id
            ...ExpenseClaimMeta
            accountingDocuments {
                id
            }
            transactions {
                id
            }
            creationDate
            creator {
                ...UserMeta
            }
            updateDate
            updater {
                ...UserMeta
            }
        }
    }
    ${expenseClaimMetaFragment}
    ${userMetaFragment}
`;

export const createExpenseClaim = gql`
    mutation CreateExpenseClaim($input: ExpenseClaimInput!) {
        createExpenseClaim(input: $input) {
            id
            creator {
                ...UserMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const updateExpenseClaim = gql`
    mutation UpdateExpenseClaim($id: ExpenseClaimID!, $input: ExpenseClaimPartialInput!) {
        updateExpenseClaim(id: $id, input: $input) {
            id
            updateDate
            updater {
                ...UserMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const deleteExpenseClaims = gql`
    mutation DeleteExpenseClaims($ids: [ExpenseClaimID!]!) {
        deleteExpenseClaims(ids: $ids)
    }
`;
