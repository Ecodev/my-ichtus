import gql from 'graphql-tag';
import {permissionsFragment, userMetaFragment} from '../../../shared/queries/fragments';

// Fragment for single display usage. Too much data for listings, and unused fields for mutations.
export const userFieldsFragment = gql`
    fragment userFields on User {
        id
        login
        firstName
        lastName
        name
        email
        birthday
        age
        phone
        postcode
        street
        locality
        familyRelationship
        receivesNewsletter
        role
        status
        hasInsurance
        swissSailing
        swissSailingType
        swissWindsurfType
        mobilePhone
        door1
        door2
        door3
        door4
        firstLogin
        lastLogin
        canOpenDoor
        licenses {
            id
            name
        }
        account {
            id
            name
            balance
            type
        }
        iban
        billingType
        remarks
        internalRemarks
        owner {
            id
            name
            email
        }
        sex
        welcomeSessionDate
        resignDate
        country {
            id
            name
        }
        creationDate
        creator {
            ...userMeta
        }
        updateDate
        updater {
            ...userMeta
        }
    }
`;

export const usersQuery = gql`
    query Users($filter: UserFilter, $sorting: [UserSorting!], $pagination: PaginationInput) {
        users(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                id
                login
                name
                email
                status
                familyRelationship
                updateDate
                creationDate
                age
                welcomeSessionDate
                resignDate
                sex
                account {
                    id
                    balance
                    type
                }
            }
            pageSize
            pageIndex
            length
        }
    }
`;

export const emailUsersQuery = gql`
    query EmailUsers($filter: UserFilter, $sorting: [UserSorting!], $pagination: PaginationInput) {
        users(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                id
                firstName
                lastName
                email
            }
        }
    }
`;

export const userQuery = gql`
    query User($id: UserID!) {
        user(id: $id) {
            ...userFields
            permissions {
                ...permissions
            }
        }
    }
    ${userFieldsFragment}
    ${userMetaFragment}
    ${permissionsFragment}
`;

export const userByTokenQuery = gql`
    query UserByToken($token: Token!) {
        userByToken(token: $token) {
            ...userFields
        }
    }
    ${userFieldsFragment}
    ${userMetaFragment}
`;

export const updateUser = gql`
    mutation UpdateUser($id: UserID!, $input: UserPartialInput!) {
        updateUser(id: $id, input: $input) {
            id
            name
            welcomeSessionDate
            updateDate
            status
            updater {
                ...userMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const createUser = gql`
    mutation CreateUser($input: UserInput!) {
        createUser(input: $input) {
            id
            name
            creator {
                ...userMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const logoutMutation = gql`
    mutation Logout {
        logout
    }
`;

export const loginMutation = gql`
    mutation Login($login: Login!, $password: String!) {
        login(login: $login, password: $password) {
            ...userFields
        }
    }
    ${userFieldsFragment}
    ${userMetaFragment}
`;

export const currentUserForProfileQuery = gql`
    query CurrentUserForProfile {
        viewer {
            ...userFields
        }
    }
    ${userFieldsFragment}
    ${userMetaFragment}
`;

export const unregisterMutation = gql`
    mutation Unregister($id: UserID!) {
        unregister(id: $id)
    }
`;

export const leaveFamilyMutation = gql`
    mutation LeaveFamily($id: UserID!) {
        leaveFamily(id: $id) {
            ...userFields
        }
    }
    ${userFieldsFragment}
    ${userMetaFragment}
`;
