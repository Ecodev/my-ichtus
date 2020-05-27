import {DefaultOptions} from 'apollo-client/ApolloClient';
import {NetworkActivityService} from '../services/network-activity.service';
import {HttpBatchLink} from 'apollo-angular-link-http-batch';
import {ApolloLink} from 'apollo-link';
import {onError} from 'apollo-link-error';
import {createUploadLink} from 'apollo-upload-client';
import {hasFilesAndProcessDate, NaturalAlertService} from '@ecodev/natural';

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
export function createApolloLink(
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
