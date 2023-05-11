import {gql} from '@apollo/client/core';

export const permissionsQuery = gql`
    query Permissions {
        permissions {
            crud {
                account {
                    create
                }
                accountingDocument {
                    create
                }
                bookable {
                    create
                }
                bookableMetadata {
                    create
                }
                bookableTag {
                    create
                }
                booking {
                    create
                }
                country {
                    create
                }
                expenseClaim {
                    create
                }
                image {
                    create
                }
                license {
                    create
                }
                message {
                    create
                }
                transaction {
                    create
                }
                transactionTag {
                    create
                }
                user {
                    create
                }
                userTag {
                    create
                }
                configuration {
                    create
                }
            }
        }
    }
`;
