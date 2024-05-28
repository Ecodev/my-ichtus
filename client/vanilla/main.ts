import {APP_INITIALIZER, enableProdMode, inject, NgZone, ɵNoopNgZone} from '@angular/core';
import {environment} from './environments/environment';
import {createApplication} from '@angular/platform-browser';
import {APP_BASE_HREF} from '@angular/common';
import {Apollo, APOLLO_OPTIONS} from 'apollo-angular';
import {HttpBatchLink} from 'apollo-angular/http';
import {InMemoryCache} from '@apollo/client/core';
import {cacheConfig} from '../app/shared/config/apollo-options.provider';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {
    graphqlQuerySigner,
    Literal,
    localStorageProvider,
    NaturalQueryVariablesManager,
    sessionStorageProvider,
} from '@ecodev/natural';
import {UserService} from '../app/admin/users/services/user.service';
import {BookableService} from '../app/admin/bookables/services/bookable.service';
import {BookingService} from '../app/admin/bookings/services/booking.service';
import {localConfig} from '../app/shared/generated-config';

if (environment.production) {
    enableProdMode();
}

function apiUrl(): string {
    const currentScript = window.document.currentScript;
    let origin = 'https://my-ichtus.lan';
    if (currentScript instanceof HTMLScriptElement) {
        origin = new URL(currentScript.src).origin;
    }

    return `${origin}/graphql`;
}

createApplication({
    providers: [
        Apollo,
        provideHttpClient(withInterceptors([graphqlQuerySigner(localConfig.signedQueries.keys.navigations)])),
        sessionStorageProvider,
        localStorageProvider,
        {provide: NgZone, useClass: ɵNoopNgZone},
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
                const userService = inject(UserService);
                const bookableService = inject(BookableService);
                const bookingService = inject(BookingService);

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
}).catch(err => console.error(err));
