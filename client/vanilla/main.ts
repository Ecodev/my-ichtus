import {APP_INITIALIZER, enableProdMode, importProvidersFrom, inject, NgZone, ɵNoopNgZone} from '@angular/core';
import {environment} from './environments/environment';
import {createApplication} from '@angular/platform-browser';
import {APP_BASE_HREF} from '@angular/common';
import {Apollo, APOLLO_OPTIONS, ApolloModule, gql} from 'apollo-angular';
import {HttpLink} from 'apollo-angular/http';
import {InMemoryCache} from '@apollo/client/core';
import {cacheConfig} from '../app/shared/config/apolloDefaultOptions';
import {HttpClientModule} from '@angular/common/http';
import {
    Literal,
    localStorageProvider,
    NaturalLinkMutationService,
    NaturalQueryVariablesManager,
    sessionStorageProvider,
} from '@ecodev/natural';
import {UserService} from '../app/admin/users/services/user.service';
import {BookableService} from '../app/admin/bookables/services/bookable.service';
import {BookingService} from '../app/admin/bookings/services/booking.service';

if (environment.production) {
    enableProdMode();
}

createApplication({
    providers: [
        importProvidersFrom(HttpClientModule, ApolloModule),
        sessionStorageProvider,
        localStorageProvider,
        {provide: NgZone, useClass: ɵNoopNgZone},
        {provide: APP_BASE_HREF, useValue: '/'},
        {
            provide: APOLLO_OPTIONS,
            useFactory: (httpLink: HttpLink) => {
                return {
                    cache: new InMemoryCache(cacheConfig),
                    link: httpLink.create({
                        uri:
                            window.location.hostname === 'navigations.ichtus.club'
                                ? 'https://ichtus.club/graphql'
                                : // : 'https://dev.ichtus.club/graphql',
                                  'https://my-ichtus.lan/graphql',
                        withCredentials: true,
                    }),
                    defaultOptions: {
                        query: {fetchPolicy: 'network-only'},
                        watchQuery: {fetchPolicy: 'network-only'},
                    },
                };
            },
            deps: [HttpLink],
        },
        {
            provide: APP_INITIALIZER,
            multi: true,
            useFactory: (): (() => void) => {
                const apollo = inject(Apollo);
                const userService = inject(UserService);
                const bookableService = inject(BookableService);
                const bookingService = inject(BookingService);
                const linkMutation = inject(NaturalLinkMutationService);

                return () => {
                    const QueryVariablesManager = NaturalQueryVariablesManager; // for retro compatibility

                    const api = {
                        gql,
                        apollo,
                        userService,
                        bookableService,
                        bookingService,
                        QueryVariablesManager,
                        linkMutation,
                    };

                    (window as Literal)['ichtusApi'] = api;
                };
            },
        },
    ],
}).catch(err => console.error(err));
