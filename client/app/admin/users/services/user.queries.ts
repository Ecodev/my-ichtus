import {gql} from 'apollo-angular';
import {permissionsFragment, userMetaFragment} from '../../../shared/queries/fragments';

// Fragment for single display usage. Too much data for listings, and unused fields for mutations.
export const userFieldsFragment = gql`
    fragment UserFields on User {
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
            ...UserMeta
        }
        updateDate
        updater {
            ...UserMeta
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
                role
                owner {
                    id
                    name
                }
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
            ...UserFields
            permissions {
                ...PermissionsRUD
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
            ...UserFields
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
                ...UserMeta
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
                ...UserMeta
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
            ...UserFields
        }
    }
    ${userFieldsFragment}
    ${userMetaFragment}
`;

export const currentUserForProfileQuery = gql`
    query CurrentUserForProfile {
        viewer {
            ...UserFields
        }
    }
    ${userFieldsFragment}
    ${userMetaFragment}
`;

export const userRolesAvailableQuery = gql`
    query UserRolesAvailables($user: UserID) {
        userRolesAvailable(user: $user)
    }
`;

export const unregisterMutation = gql`
    mutation Unregister($id: UserID!) {
        unregister(id: $id)
    }
`;

export const leaveFamilyMutation = gql`
    mutation LeaveFamily($id: UserID!) {
        leaveFamily(id: $id) {
            ...UserFields
        }
    }
    ${userFieldsFragment}
    ${userMetaFragment}
`;
