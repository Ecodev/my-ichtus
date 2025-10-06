import {gql} from '@apollo/client/core';
import {permissionsFragment, userContactDataFragment, userMetaFragment} from '../../../shared/queries/fragments';

export const bookableUsageFragment = gql`
    fragment BookableUsage on Bookable {
        id
        simultaneousBookingMaximum
        waitingListLength
        simultaneousBookings {
            id
        }
        simultaneousApplications {
            id
        }
    }
`;

export const bookableMetaFragment = gql`
    fragment BookableMeta on Bookable {
        id
        name
        description
        isActive
        state
        verificationDate
        licenses {
            id
            name
        }
        bookableTags {
            id
            name
        }
        initialPrice
        periodicPrice
        purchasePrice
        creditAccount {
            id
            name
        }
        code
        simultaneousBookingMaximum
        waitingListLength
        bookingType
        remarks
        image {
            id
        }
        creationDate
        creator {
            ...UserMeta
        }
        updateDate
        updater {
            ...UserMeta
        }
        owner {
            ...UserMeta
        }
    }
    ${userMetaFragment}
`;

export const bookablesQuery = gql`
    query Bookables($filter: BookableFilter, $sorting: [BookableSorting!], $pagination: PaginationInput) {
        bookables(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                ...BookableMeta
            }
            pageSize
            pageIndex
            length
            totalPurchasePrice
            totalInitialPrice
            totalPeriodicPrice
        }
    }
    ${bookableMetaFragment}
`;

// This should be a strict superset of bookablesQuery, because it is used in the same component
export const usageBookablesQuery = gql`
    query UsageBookables($filter: BookableFilter, $sorting: [BookableSorting!], $pagination: PaginationInput) {
        bookables(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                ...BookableMeta
                ...BookableUsage
                owner {
                    ...UserContactData
                }
                simultaneousBookings {
                    id
                    owner {
                        id
                        name
                    }
                }
            }
            pageSize
            pageIndex
            length
            totalPurchasePrice
            totalInitialPrice
            totalPeriodicPrice
        }
    }
    ${bookableMetaFragment}
    ${bookableUsageFragment}
    ${userContactDataFragment}
`;

export const bookableQuery = gql`
    query Bookable($id: BookableID!) {
        bookable(id: $id) {
            ...BookableMeta
            permissions {
                ...PermissionsRUD
            }
        }
    }
    ${bookableMetaFragment}
    ${permissionsFragment}
`;

export const createBookable = gql`
    mutation CreateBookable($input: BookableInput!) {
        createBookable(input: $input) {
            id
            creator {
                ...UserMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const updateBookable = gql`
    mutation UpdateBookable($id: BookableID!, $input: BookablePartialInput!) {
        updateBookable(id: $id, input: $input) {
            id
            name
            verificationDate
            updateDate
            updater {
                ...UserMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const deleteBookables = gql`
    mutation DeleteBookables($ids: [BookableID!]!) {
        deleteBookables(ids: $ids)
    }
`;
