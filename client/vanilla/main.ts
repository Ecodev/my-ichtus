import {
    APP_INITIALIZER,
    inject,
    provideExperimentalZonelessChangeDetection,
    provideZoneChangeDetection,
} from '@angular/core';
import {createApplication} from '@angular/platform-browser';
import {APP_BASE_HREF} from '@angular/common';
import {Apollo, APOLLO_OPTIONS} from 'apollo-angular';
import {HttpBatchLink} from 'apollo-angular/http';
import {InMemoryCache} from '@apollo/client/core';
import {cacheConfig} from '../app/shared/config/apollo-options.provider';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {graphqlQuerySigner, Literal, NaturalQueryVariablesManager} from '@ecodev/natural';
import {UserForVanillaService} from './user-for-vanilla.service';
import {BookableForVanillaService} from './bookable-for-vanilla.service';
import {BookingForVanillaService} from './booking-for-vanilla.service';
import {localConfig} from '../app/shared/generated-config';

function apiUrl(): string {
    return new URL('/graphql', import.meta.url).toString();
}

createApplication({
    providers: [
        Apollo,
        provideHttpClient(withInterceptors([graphqlQuerySigner(localConfig.signedQueries.keys.navigations)])),
        provideExperimentalZonelessChangeDetection(),
        {provide: APP_BASE_HREF, useValue: '/'},
        {
            provide: APOLLO_OPTIONS,
            useFactory: () => {
                const httpBatchLink = inject(HttpBatchLink);
                return {
                    cache: new InMemoryCache(cacheConfig),
                    link: httpBatchLink.create({
                        uri: apiUrl(),
                        withCredentials: true,
                    }),
                    defaultOptions: {
                        query: {fetchPolicy: 'network-only'},
                        watchQuery: {fetchPolicy: 'network-only'},
                    },
                };
            },
        },
        {
            provide: APP_INITIALIZER,
            multi: true,
            useFactory: (): (() => void) => {
                const userService = inject(UserForVanillaService);
                const bookableService = inject(BookableForVanillaService);
                const bookingService = inject(BookingForVanillaService);

                return () => {
                    const QueryVariablesManager = NaturalQueryVariablesManager; // for retro compatibility

                    const api = {
                        userService,
                        bookableService,
                        bookingService,
                        QueryVariablesManager,
                    };

                    (window as Literal).ichtusApi = api;
                };
            },
        },
    ],
}).catch((err: unknown) => {
    console.error(err);
});
