import {gql} from '@apollo/client/core';

export const logsQuery = gql`
    query Logs($filter: LogFilter, $sorting: [LogSorting!], $pagination: PaginationInput) {
        logs(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                id
                creator {
                    id
                    name
                }
                creationDate
                message
                referer
                ip
            }
            pageSize
            pageIndex
            length
        }
    }
`;
