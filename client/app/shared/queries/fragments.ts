import gql from 'graphql-tag';

export const userMetaFragment = gql`
    fragment UserMeta on User {
        id
        name
        email
    }
`;

export const permissionsFragment = gql`
    fragment PermissionsRUD on Permissions {
        read
        update
        delete
    }
`;
