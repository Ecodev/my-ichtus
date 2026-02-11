import {gql} from '@apollo/client/core';

export const configurationQuery = gql`
    query ConfigurationQuery($key: String!) {
        configuration(key: $key)
    }
`;

export const updateConfiguration = gql`
    mutation UpdateConfiguration($key: String!, $value: String!) {
        updateConfiguration(key: $key, value: $value)
    }
`;
