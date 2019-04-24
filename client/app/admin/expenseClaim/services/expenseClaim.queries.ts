import gql from 'graphql-tag';
import { permissionsFragment, userMetaFragment } from '../../../shared/queries/fragments';

export const expenseClaimMetaFragment = gql`
    fragment expenseClaimMeta on ExpenseClaim {
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
            account {
                id
                name
            }
        }
        creationDate
        updateDate
    }
`;

export const expenseClaimsQuery = gql`
    query ExpenseClaims($filter: ExpenseClaimFilter, $sorting: [ExpenseClaimSorting!], $pagination: PaginationInput) {
        expenseClaims(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                ...expenseClaimMeta
            }
            pageSize
            pageIndex
            length
        }
    }
${expenseClaimMetaFragment}`;

export const expenseClaimQuery = gql`
    query ExpenseClaim($id: ExpenseClaimID!) {
        expenseClaim(id: $id) {
            id
            ...expenseClaimMeta
            accountingDocuments {
                id
            }
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
    ${expenseClaimMetaFragment}
    ${userMetaFragment}
    ${permissionsFragment}
`;

export const createExpenseClaim = gql`
    mutation CreateExpenseClaim($input: ExpenseClaimInput!) {
        createExpenseClaim(input: $input) {
            id
            creator {
                ...userMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const updateExpenseClaim = gql`
    mutation UpdateExpenseClaim($id: ExpenseClaimID!, $input: ExpenseClaimPartialInput!) {
        updateExpenseClaim(id:$id, input:$input) {
            id
            updateDate
            updater {
                ...userMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const deleteExpenseClaims = gql`
    mutation DeleteExpenseClaims ($ids: [ExpenseClaimID!]!){
        deleteExpenseClaims(ids: $ids)
    }`;
