import {gql} from '@apollo/client/core';
import {permissionsFragment, userMetaFragment} from '../../../shared/queries/fragments';

// Minimal fields required for account selection/display, this should NOT include fields to manage a account
export const minimalAccountFragment = gql`
    fragment MinimalAccount on Account {
        id
        name
        type
    }
`;

export const accountMetaFragment = gql`
    fragment AccountMeta on Account {
        id
        code
        name
        fullName
        iban
        totalBalance
        budgetAllowed
        budgetBalance
        totalBalanceFormer
        type
        owner {
            id
            email
            name
            iban
        }
        creationDate
        updateDate
        ...MinimalAccount
    }
    ${minimalAccountFragment}
`;

export const accountsQuery = gql`
    query AccountsQuery($filter: AccountFilter, $sorting: [AccountSorting!], $pagination: PaginationInput) {
        accounts(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                ...AccountMeta
            }
            pageSize
            pageIndex
            length
        }
    }
    ${accountMetaFragment}
`;

export const accountQuery = gql`
    query AccountQuery($id: AccountID!) {
        account(id: $id) {
            id
            ...AccountMeta
            parent {
                id
                name
                parent {
                    id
                    name
                    parent {
                        id
                        name
                    }
                }
            }
            creator {
                ...UserMeta
            }
            updater {
                ...UserMeta
            }
            permissions {
                ...PermissionsRUD
            }
        }
    }
    ${accountMetaFragment}
    ${userMetaFragment}
    ${permissionsFragment}
`;

export const nextCodeAvailableQuery = gql`
    query NextAccountCodeQuery($parent: AccountID) {
        nextAccountCode(parent: $parent)
    }
`;

export const createAccount = gql`
    mutation CreateAccount($input: AccountInput!) {
        createAccount(input: $input) {
            id
            creator {
                ...UserMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const updateAccount = gql`
    mutation UpdateAccount($id: AccountID!, $input: AccountPartialInput!) {
        updateAccount(id: $id, input: $input) {
            id
            name
            fullName
            budgetBalance
            updateDate
            updater {
                ...UserMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const deleteAccounts = gql`
    mutation DeleteAccounts($ids: [AccountID!]!) {
        deleteAccounts(ids: $ids)
    }
`;

export const exportAccountingReport = gql`
    mutation ExportAccountingReport($date: Date!, $datePrevious: Date, $showBudget: Boolean!) {
        exportAccountingReport(date: $date, datePrevious: $datePrevious, showBudget: $showBudget)
    }
`;

export const accountingClosing = gql`
    mutation AccountingClosing($date: Date) {
        accountingClosing(date: $date) {
            id
        }
    }
`;
