import {gql} from '@apollo/client/core';

export const bookableMetadatasQuery = gql`
    query BookableMetadatas(
        $filter: BookableMetadataFilter
        $sorting: [BookableMetadataSorting!]
        $pagination: PaginationInput
    ) {
        bookableMetadatas(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                id
                name
                value
                bookable {
                    id
                }
            }
            pageSize
            pageIndex
            length
        }
    }
`;

export const createBookableMetadataMutation = gql`
    mutation CreateBookableMetadata($input: BookableMetadataInput!) {
        createBookableMetadata(input: $input) {
            id
        }
    }
`;

export const updateBookableMetadataMutation = gql`
    mutation UpdateBookableMetadata($id: BookableMetadataID!, $input: BookableMetadataPartialInput!) {
        updateBookableMetadata(id: $id, input: $input) {
            id
        }
    }
`;

export const deleteBookableMetadatas = gql`
    mutation DeleteBookableMetadatas($ids: [BookableMetadataID!]!) {
        deleteBookableMetadatas(ids: $ids)
    }
`;
