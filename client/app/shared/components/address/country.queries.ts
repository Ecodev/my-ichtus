import {gql} from '@apollo/client/core';
import {permissionsFragment} from '../../queries/fragments';

export const countriesQuery = gql`
    query Countries($filter: CountryFilter, $pagination: PaginationInput) {
        countries(filter: $filter, pagination: $pagination) {
            items {
                id
                code
                name
            }
            pageSize
            pageIndex
            length
        }
    }
`;

export const countryQuery = gql`
    query Country($id: CountryID!) {
        country(id: $id) {
            id
            code
            name
            permissions {
                ...PermissionsRUD
            }
        }
    }
    ${permissionsFragment}
`;
