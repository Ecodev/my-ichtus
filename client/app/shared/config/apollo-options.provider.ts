import {HttpBatchLink, HttpLink} from 'apollo-angular/http';
import {type ApolloClient, type ApolloLink, InMemoryCache, type InMemoryCacheConfig} from '@apollo/client';
import {
    createErrorLink,
    createHttpLink,
    ErrorService,
    NaturalAlertService,
    NetworkActivityService,
} from '@ecodev/natural';
import {APOLLO_OPTIONS} from 'apollo-angular';
import {inject, type Provider} from '@angular/core';

import {localConfig} from '../generated-config';

export const apolloDefaultOptions: ApolloClient.Options['defaultOptions'] = {
    query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'none',
    },
    watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'none',
        returnPartialData: false,
        notifyOnNetworkStatusChange: false,
    },
    mutate: {
        errorPolicy: 'none',
    },
};

export const cacheConfig: InMemoryCacheConfig = {
    typePolicies: {
        Permissions: {
            // Incoming permissions always overwrite whatever permission might already exist
            merge: true,
        },
    },
};

/**
 * Create an Apollo link that support batch, file upload, and network activity
 */
function createApolloLink(
    networkActivityService: NetworkActivityService,
    errorService: ErrorService,
    alertService: NaturalAlertService,
    httpLink: HttpLink,
    httpBatchLink: HttpBatchLink,
): ApolloLink {
    const errorLink = createErrorLink(networkActivityService, errorService, alertService);

    return errorLink.concat(
        createHttpLink(httpLink, httpBatchLink, {
            uri: '/graphql?v=' + localConfig.version,
        }),
    );
}

function apolloOptionsFactory(): ApolloClient.Options {
    const networkActivityService = inject(NetworkActivityService);
    const errorService = inject(ErrorService);
    const alertService = inject(NaturalAlertService);
    const httpLink = inject(HttpLink);
    const httpBatchLink = inject(HttpBatchLink);
    const link = createApolloLink(networkActivityService, errorService, alertService, httpLink, httpBatchLink);

    return {
        link: link,
        cache: new InMemoryCache(cacheConfig),
        defaultOptions: apolloDefaultOptions,
    };
}

export const apolloOptionsProvider: Provider = {
    provide: APOLLO_OPTIONS,
    useFactory: apolloOptionsFactory,
};
