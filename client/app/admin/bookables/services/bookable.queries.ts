import gql from 'graphql-tag';
import {permissionsFragment, userMetaFragment} from '../../../shared/queries/fragments';

export const bookableMetaFragment = gql`
    fragment bookableMeta on Bookable {
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
        bookings {
            id
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
        bookingType
        remarks
        image {
            id
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
    ${userMetaFragment}
`;

export const bookablesQuery = gql`
    query Bookables($filter: BookableFilter, $sorting: [BookableSorting!], $pagination: PaginationInput) {
        bookables(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                ...bookableMeta
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

export const usageBookablesQuery = gql`
    query UsageBookables($filter: BookableFilter, $sorting: [BookableSorting!], $pagination: PaginationInput) {
        bookables(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                id
                name
                code
                isActive
                initialPrice
                periodicPrice
                purchasePrice
                purchasePrice
                simultaneousBookingMaximum
                sharedBookings {
                    id
                    owner {
                        id
                        name
                    }
                }
                creationDate
                updateDate
            }
            pageSize
            pageIndex
            length
            totalPurchasePrice
            totalInitialPrice
            totalPeriodicPrice
        }
    }
`;

export const bookableQuery = gql`
    query Bookable($id: BookableID!) {
        bookable(id: $id) {
            ...bookableMeta
            permissions {
                ...permissions
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
                ...userMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const updateBookable = gql`
    mutation UpdateBookable($id: BookableID!, $input: BookablePartialInput!) {
        updateBookable(id: $id, input: $input) {
            id
            verificationDate
            updateDate
            updater {
                ...userMeta
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
