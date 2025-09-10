import {HttpBatchLink, HttpLink} from 'apollo-angular/http';
import {
    ApolloClientOptions,
    ApolloLink,
    DefaultOptions,
    InMemoryCache,
    InMemoryCacheConfig,
    NormalizedCacheObject,
} from '@apollo/client/core';
import {onError} from '@apollo/client/link/error';
import {createHttpLink, NaturalAlertService, NetworkActivityService} from '@ecodev/natural';
import {APOLLO_OPTIONS} from 'apollo-angular';
import {inject, Provider} from '@angular/core';
import {localConfig} from '../generated-config';
import {HttpErrorResponse} from '@angular/common/http';

export const apolloDefaultOptions: DefaultOptions = {
    query: {
        fetchPolicy: 'network-only',
    },
    watchQuery: {
        fetchPolicy: 'cache-and-network',
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
 * Create an Apollo link to show alert in case of error, and message if network is down
 */
function createErrorLink(
    networkActivityService: NetworkActivityService,
    alertService: NaturalAlertService,
): ApolloLink {
    return onError(errorResponse => {
        // Network errors are not caught by uploadInterceptor, so we need to decrease pending queries
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const networkError = errorResponse.networkError;
        if (networkError) {
            networkActivityService.decrease();

            // Show the error message if is:
            // - an 413 error from `graphql-upload` about `post_max_size`
            // - a 500 error about max_execution_time
            if (
                networkError instanceof HttpErrorResponse &&
                [413, 500].includes(networkError.status) &&
                typeof networkError.error?.message === 'string'
            ) {
                alertService.error(networkError.error.message, 5000);
                networkActivityService.addErrors([networkError.error]);
            } else {
                alertService.error(`Une erreur est survenue sur le réseau`);
            }
        }

        // Show Graphql responses with errors to end-users (but do not decrease pending queries because it is done by uploadInterceptor)
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        if (errorResponse.graphQLErrors) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            errorResponse.graphQLErrors.forEach(error => {
                if ('extensions' in error && error.extensions?.showSnack) {
                    // Show whatever server prepared for end-user, with a bit more time to read
                    alertService.error(error.message, 5000);
                } else {
                    // Use a generic message for internal error not to frighten end-user too much
                    alertService.error('Une erreur est survenue du côté du serveur');
                }
            });

            // eslint-disable-next-line @typescript-eslint/no-deprecated
            networkActivityService.addErrors(errorResponse.graphQLErrors);
        }
    });
}

/**
 * Create an Apollo link that support batch, file upload, and network activity
 */
function createApolloLink(
    networkActivityService: NetworkActivityService,
    alertService: NaturalAlertService,
    httpLink: HttpLink,
    httpBatchLink: HttpBatchLink,
): ApolloLink {
    const errorLink = createErrorLink(networkActivityService, alertService);

    return errorLink.concat(
        createHttpLink(httpLink, httpBatchLink, {
            uri: '/graphql?v=' + localConfig.version,
        }),
    );
}

function apolloOptionsFactory(): ApolloClientOptions<NormalizedCacheObject> {
    const networkActivityService = inject(NetworkActivityService);
    const alertService = inject(NaturalAlertService);
    const httpLink = inject(HttpLink);
    const httpBatchLink = inject(HttpBatchLink);
    const link = createApolloLink(networkActivityService, alertService, httpLink, httpBatchLink);

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
