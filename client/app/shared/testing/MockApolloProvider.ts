import {Apollo} from 'apollo-angular';
import {ApolloClient, InMemoryCache} from '@apollo/client/core';
import {SchemaLink} from '@apollo/client/link/schema';
import {Injectable, NgZone} from '@angular/core';
import {buildClientSchema} from 'graphql';
import {addMocksToSchema} from '@graphql-tools/mock';
import {schema as introspectionResult} from './../../../../data/tmp/schema';
import {apolloDefaultOptions, cacheConfig} from '../config/apolloDefaultOptions';

/**
 * A mock Apollo to be used in tests only
 */
@Injectable({
    providedIn: 'root',
})
class MockApollo extends Apollo {
    public constructor(ngZone: NgZone) {
        super(ngZone);
        this.client = this.createMockClient();
    }

    /**
     * This will create a fake ApolloClient who can responds to queries
     * against our real schema with random values
     */
    private createMockClient(): ApolloClient<unknown> {
        const schema = buildClientSchema(introspectionResult.data as any);

        // Configure hardcoded mocked values on a type basis.
        // That means all data will look be very similar, but at least
        // tests are robust and won't change if/when random generators
        // would be used differently
        const mocks = {
            ID: () => '456',
            Int: () => 1,
            Float: () => 0.5,
            String: () => 'test string',
            Boolean: () => true,
            Chronos: () => '2018-01-18T11:43:31',
            Date: () => '2018-02-27',
            Login: () => 'test string',
            Email: () => 'test@example.com',
            Relationship: () => 'householder',
            UserRole: () => 'member',
            UserStatus: () => 'active',
            AccountType: () => 'revenue',
            Sex: () => 'not_known',
            BillingType: () => 'electronic',
            SwissWindsurfType: () => 'passive',
            SwissSailingType: () => 'junior',
            Money: () => '1.25',
        };

        const schemaWithMocks = addMocksToSchema({schema, mocks, preserveResolvers: true});

        const apolloCache = new InMemoryCache(cacheConfig);

        return new ApolloClient({
            cache: apolloCache,
            link: new SchemaLink({schema: schemaWithMocks}),
            defaultOptions: apolloDefaultOptions,
        });
    }
}

/**
 * This is the only way to use our MockApollo
 */
export const mockApolloProvider = {
    provide: Apollo,
    useClass: MockApollo,
};
