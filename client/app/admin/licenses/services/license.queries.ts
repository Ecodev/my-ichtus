import gql from 'graphql-tag';
import { permissionsFragment, userMetaFragment } from '../../../shared/queries/fragments';

export const licensesQuery = gql`
    query Licenses($filter: LicenseFilter, $sorting: [LicenseSorting!], $pagination: PaginationInput) {
        licenses(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                id
                name
            }
            pageSize
            pageIndex
            length
        }
    }
`;

export const licenseQuery = gql`
    query License($id: LicenseID!) {
        license(id: $id) {
            id
            name
            creationDate
            creator {
                ...userMeta
            }
            updateDate
            updater {
                ...userMeta
            }
            permissions {
                ...permissions
            }
        }
    }
    ${userMetaFragment}
    ${permissionsFragment}
`;

export const createLicense = gql`
    mutation CreateLicense($input: LicenseInput!) {
        createLicense(input: $input) {
            id
            creator {
                ...userMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const updateLicense = gql`
    mutation UpdateLicense($id: LicenseID!, $input: LicensePartialInput!) {
        updateLicense(id:$id, input:$input) {
            id
            updateDate
            updater {
                ...userMeta
            }
        }
    }
    ${userMetaFragment}
`;

export const deleteLicenses = gql`
    mutation DeleteLicenses ($ids: [LicenseID!]!){
        deleteLicenses(ids: $ids)
    }`;

