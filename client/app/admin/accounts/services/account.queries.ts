import {gql} from 'apollo-angular';
import {permissionsFragment, userMetaFragment} from '../../../shared/queries/fragments';

export const accountMetaFragment = gql`
    fragment AccountMeta on Account {
        id
        code
        name
        fullName
        iban
        totalBalance
        type
        owner {
            id
            email
            name
            iban
        }
        creationDate
        updateDate
    }
`;

export const accountsQuery = gql`
    query Accounts($filter: AccountFilter, $sorting: [AccountSorting!], $pagination: PaginationInput) {
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
    query Account($id: AccountID!) {
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
    query NextAccountCode {
        nextAccountCode
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
