import gql from 'graphql-tag';
import {permissionsFragment, userMetaFragment} from '../../../shared/queries/fragments';

export const transactionTagsQuery = gql`
    query TransactionTags(
        $filter: TransactionTagFilter
        $sorting: [TransactionTagSorting!]
        $pagination: PaginationInput
    ) {
        transactionTags(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                id
                name
                color
            }
            pageSize
            pageIndex
            length
        }
    }
`;

export const transactionTagQuery = gql`
    query TransactionTag($id: TransactionTagID!) {
        transactionTag(id: $id) {
            id
            name
            color
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
    ${userMetaFragment}
    ${permissionsFragment}
`;

export const createTransactionTag = gql`
    mutation CreateTransactionTag($input: TransactionTagInput!) {
        createTransactionTag(input: $input) {
            id
            creator {
                ...UserMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const updateTransactionTag = gql`
    mutation UpdateTransactionTag($id: TransactionTagID!, $input: TransactionTagPartialInput!) {
        updateTransactionTag(id: $id, input: $input) {
            id
            updateDate
            updater {
                ...UserMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const deleteTransactionTags = gql`
    mutation DeleteTransactionTags($ids: [TransactionTagID!]!) {
        deleteTransactionTags(ids: $ids)
    }
`;
