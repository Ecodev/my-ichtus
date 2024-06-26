import {gql} from '@apollo/client/core';
import {permissionsFragment, userMetaFragment} from '../../../shared/queries/fragments';

export const userTagsQuery = gql`
    query UserTags($filter: UserTagFilter, $sorting: [UserTagSorting!], $pagination: PaginationInput) {
        userTags(filter: $filter, sorting: $sorting, pagination: $pagination) {
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

export const userTagQuery = gql`
    query UserTag($id: UserTagID!) {
        userTag(id: $id) {
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

export const createUserTag = gql`
    mutation CreateUserTag($input: UserTagInput!) {
        createUserTag(input: $input) {
            id
            creator {
                ...UserMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const updateUserTag = gql`
    mutation UpdateUserTag($id: UserTagID!, $input: UserTagPartialInput!) {
        updateUserTag(id: $id, input: $input) {
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

export const deleteUserTags = gql`
    mutation DeleteUserTags($ids: [UserTagID!]!) {
        deleteUserTags(ids: $ids)
    }
`;
