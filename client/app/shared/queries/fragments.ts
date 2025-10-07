import {gql} from '@apollo/client/core';

export const userMetaFragment = gql`
    fragment UserMeta on User {
        id
        name
        email
    }
`;

export const userLeaveFamilyFragment = gql`
    fragment UserLeaveFamily on User {
        id
        owner {
            id
        }
    }
`;

export const userContactDataFragment = gql`
    fragment UserContactData on User {
        id
        name
        email
        mobilePhone
    }
`;

export const permissionsFragment = gql`
    fragment PermissionsRUD on Permissions {
        read
        update
        delete
    }
`;
