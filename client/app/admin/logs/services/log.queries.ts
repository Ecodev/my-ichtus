import gql from 'graphql-tag';

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
