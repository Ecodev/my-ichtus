import {gql} from '@apollo/client/core';
import {permissionsFragment, userMetaFragment} from '../../../shared/queries/fragments';

export const bookableTagsQuery = gql`
    query BookableTags($filter: BookableTagFilter, $sorting: [BookableTagSorting!], $pagination: PaginationInput) {
        bookableTags(filter: $filter, sorting: $sorting, pagination: $pagination) {
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

export const bookableTagQuery = gql`
    query BookableTag($id: BookableTagID!) {
        bookableTag(id: $id) {
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

export const createBookableTag = gql`
    mutation CreateBookableTag($input: BookableTagInput!) {
        createBookableTag(input: $input) {
            id
            creator {
                ...UserMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const updateBookableTag = gql`
    mutation UpdateBookableTag($id: BookableTagID!, $input: BookableTagPartialInput!) {
        updateBookableTag(id: $id, input: $input) {
            id
            name
            updateDate
            updater {
                ...UserMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const deleteBookableTags = gql`
    mutation DeleteBookableTags($ids: [BookableTagID!]!) {
        deleteBookableTags(ids: $ids)
    }
`;
