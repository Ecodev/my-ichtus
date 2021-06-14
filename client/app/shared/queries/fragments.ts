import {gql} from 'apollo-angular';

export const userMetaFragment = gql`
    fragment UserMeta on User {
        id
        name
        email
    }
`;

export const userContactDataFragment = gql`
    fragment UserContactData on User {
        id
        firstName
        lastName
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
