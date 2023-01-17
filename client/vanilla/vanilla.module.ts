import {Apollo, APOLLO_OPTIONS, ApolloModule, gql} from 'apollo-angular';
import {InMemoryCache} from '@apollo/client/core';
import {HttpLink} from 'apollo-angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {DoBootstrap, NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {BookableService} from '../app/admin/bookables/services/bookable.service';
import {VanillaRoutingModule} from './vanilla-routing.module';
import {APP_BASE_HREF} from '@angular/common';
import {UserService} from '../app/admin/users/services/user.service';
import {BookingService} from '../app/admin/bookings/services/booking.service';
import {Literal, NaturalCommonModule, NaturalLinkMutationService, NaturalQueryVariablesManager} from '@ecodev/natural';
import {cacheConfig} from '../app/shared/config/apolloDefaultOptions';

@NgModule({
    imports: [BrowserModule, HttpClientModule, VanillaRoutingModule, NaturalCommonModule, ApolloModule],
    providers: [
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
                                : 'https://dev.ichtus.club/graphql',
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
    ],
})
export class VanillaModule implements DoBootstrap {
    public constructor(
        apollo: Apollo,
        userService: UserService,
        bookableService: BookableService,
        bookingService: BookingService,
        linkMutation: NaturalLinkMutationService,
    ) {
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
    }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    public ngDoBootstrap(): void {
        // Nothing to do at all here
    }
}
