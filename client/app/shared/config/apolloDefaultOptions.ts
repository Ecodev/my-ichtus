import {HttpBatchLink} from 'apollo-angular/http';
import {
    ApolloClientOptions,
    ApolloLink,
    DefaultOptions,
    InMemoryCache,
    NormalizedCacheObject,
} from '@apollo/client/core';
import {onError} from '@apollo/client/link/error';
import {NetworkActivityService} from '../services/network-activity.service';
import {createUploadLink} from 'apollo-upload-client';
import {hasFilesAndProcessDate, NaturalAlertService} from '@ecodev/natural';
import {ErrorService} from '../components/error/error.service';
import {APOLLO_OPTIONS} from 'apollo-angular';
import {Provider} from '@angular/core';

export const apolloDefaultOptions: DefaultOptions = {
    query: {
        fetchPolicy: 'network-only',
    },
    watchQuery: {
        fetchPolicy: 'cache-and-network',
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
        if (errorResponse.networkError) {
            alertService.error('Une erreur est survenue sur le réseau');
            networkActivityService.decrease();
        }

        // Show Graphql responses with errors to end-users (but do not decrease pending queries because it is done by uploadInterceptor)
        if (errorResponse.graphQLErrors) {
            errorResponse.graphQLErrors.forEach(error => {
                // Use generic message for internal error not to frighten end-user too much
                if (error.extensions && error.extensions.category === 'internal') {
                    alertService.error('Une erreur est survenue du côté du serveur');
                } else {
                    // Show whatever server prepared for end-user, with a little bit more time to read
                    alertService.error(error.message, 5000);
                }
            });

            networkActivityService.updateErrors(errorResponse.graphQLErrors);
        }
    });
}

/**
 * Create an Apollo link that support batch, file upload, and network activity
 */
function createApolloLink(
    networkActivityService: NetworkActivityService,
    alertService: NaturalAlertService,
    httpBatchLink: HttpBatchLink,
): ApolloLink {
    const options = {
        uri: '/graphql',
        credentials: 'include',
    };

    const uploadInterceptor = new ApolloLink((operation, forward) => {
        networkActivityService.increase();

        if (forward) {
            return forward(operation).map(response => {
                networkActivityService.decrease();
                return response;
            });
        } else {
            return null;
        }
    });

    // If query has no file, batch it, otherwise upload only that query
    const httpLink = ApolloLink.split(
        ({variables}) => hasFilesAndProcessDate(variables),
        uploadInterceptor.concat(createUploadLink(options)),
        httpBatchLink.create(options),
    );

    const errorLink = createErrorLink(networkActivityService, alertService);

    return errorLink.concat(httpLink);
}

function apolloOptionsFactory(
    networkActivityService: NetworkActivityService,
    errorService: ErrorService,
    alertService: NaturalAlertService,
    httpBatchLink: HttpBatchLink,
): ApolloClientOptions<NormalizedCacheObject> {
    const link = createApolloLink(networkActivityService, alertService, httpBatchLink);

    return {
        link: link,
        cache: new InMemoryCache(),
        defaultOptions: apolloDefaultOptions,
    };
}

export const apolloOptionsProvider: Provider = {
    provide: APOLLO_OPTIONS,
    useFactory: apolloOptionsFactory,
    deps: [NetworkActivityService, ErrorService, NaturalAlertService, HttpBatchLink],
};
