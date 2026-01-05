import {inject, Injectable} from '@angular/core';
import {NaturalAbstractModelService, NaturalQueryVariablesManager} from '@ecodev/natural';
import {from, Observable, switchMap} from 'rxjs';
import {map} from 'rxjs/operators';
import {
    CurrentUserForProfileQuery,
    LogicalOperator,
    Login,
    LoginVariables,
    SortingOrder,
    UserQuery,
    UsersQuery,
    UserSortingField,
    UserStatus,
    UsersQueryVariables,
    UserQueryVariables,
} from '../shared/generated-types';
import {currentUserForProfileQuery, loginMutation, userQuery, usersQuery} from '../admin/users/services/user.queries';
import {closePopUp, getNiceTime} from './general/home';
import {popLogin} from './member/login';
import {createSearchEntries} from './member/user';
import {Cahier} from './cahier/methods';
import {BookingForVanillaService} from './booking-for-vanilla.service';

@Injectable({
    providedIn: 'root',
})
export class UserForVanillaService extends NaturalAbstractModelService<
    UserQuery['user'],
    UserQueryVariables,
    UsersQuery['users'],
    UsersQueryVariables,
    never,
    never,
    never,
    never,
    never,
    never
> {
    private readonly bookingService = inject(BookingForVanillaService);

    public constructor() {
        super('user', userQuery, usersQuery, null, null, null);
    }

    private internalLogin(loginData: LoginVariables): Observable<Login['login']> {
        // Be sure to destroy all Apollo data, before changing user
        return from(this.apollo.client.resetStore()).pipe(
            switchMap(() =>
                this.apollo
                    .mutate<Login, LoginVariables>({
                        mutation: loginMutation,
                        variables: loginData,
                    })
                    .pipe(map(result => result.data!.login)),
            ),
        );
    }

    private getViewer(): Observable<CurrentUserForProfileQuery['viewer']> {
        return this.apollo
            .query<CurrentUserForProfileQuery>({
                query: currentUserForProfileQuery,
            })
            .pipe(map(result => result.data.viewer));
    }

    public login(pwd: string): void {
        //console.log("LOGIN");

        this.internalLogin({
            login: 'bookingonly',
            password: pwd,
        }).subscribe(result => {
            closePopUp('last');

            //console.log("result of login :", result);

            if (result != null) {
                if (result.login === 'bookingonly') {
                    this.isConnected();
                } else {
                    console.error('Mauvais utilisateur connecté... (' + result.login + ')');
                }
            } else {
                console.error("Problème d'authentification...");
            }
        });
    }

    // have to log in
    private haveToLogin(): void {
        if (window.location.hostname === 'ichtus.club') {
            popLogin();
        } else {
            setTimeout(() => {
                this.login('bookingonly');
            }, 2000); // auto mdp, timeout to avoid overloading the server
        }
    }

    // is connected
    private isConnected(): void {
        console.warn('Connecté à ' + getNiceTime(new Date()));
        this.bookingService.getActualBookingList();
    }

    // actualizeLoginButton
    public checkLogin(): void {
        this.getViewer().subscribe(user => {
            //console.log("user:", user);

            // pas connecté
            if (!user) {
                console.error('Pas connecté');
                this.haveToLogin();
            }
            // connecté
            else {
                if (user.login === 'bookingonly') {
                    this.isConnected();
                } else {
                    console.error('Mauvais utilisateur connecté... (' + user.name + ')');
                    this.haveToLogin();
                }
            }
        });
    }

    // getUsersList FOR user.js
    public getUsersList(text = ''): void {
        let filter: UsersQueryVariables;
        const texts = [];

        const parts = text.split(' ');
        for (const item of parts) {
            if (item != '') {
                texts.push(item);
            }
        }

        const nbr = texts.length;
        if (nbr == 1) {
            filter = {
                filter: {
                    groups: [
                        {
                            conditionsLogic: LogicalOperator.OR,
                            conditions: [
                                {
                                    firstName: {
                                        like: {
                                            value: texts[0] + '%',
                                        },
                                    },
                                },
                                {
                                    lastName: {
                                        like: {
                                            value: texts[0] + '%',
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            groupLogic: LogicalOperator.AND,
                            conditions: [
                                {
                                    id: {
                                        equal: {
                                            value: '7083', // booking only user
                                            not: true,
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            groupLogic: LogicalOperator.AND,
                            conditions: [
                                {
                                    status: {
                                        // status
                                        equal: {
                                            value: UserStatus.Active,
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            };
        } else if (nbr == 2) {
            filter = {
                filter: {
                    groups: [
                        {
                            conditions: [
                                {
                                    firstName: {
                                        like: {
                                            value: texts[0] + '%',
                                        },
                                    },
                                },
                                {
                                    lastName: {
                                        like: {
                                            value: texts[1] + '%',
                                        },
                                    },
                                },
                                {
                                    id: {
                                        equal: {
                                            value: '7083', // booking only user
                                            not: true,
                                        },
                                    },
                                },
                                {
                                    status: {
                                        // status
                                        equal: {
                                            value: UserStatus.Active,
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            groupLogic: LogicalOperator.OR,
                            conditions: [
                                {
                                    firstName: {
                                        like: {
                                            value: texts[1] + '%',
                                        },
                                    },
                                },
                                {
                                    lastName: {
                                        like: {
                                            value: texts[0] + '%',
                                        },
                                    },
                                },
                                {
                                    id: {
                                        equal: {
                                            value: '7083', // booking only user
                                            not: true,
                                        },
                                    },
                                },
                                {
                                    status: {
                                        // status
                                        equal: {
                                            value: UserStatus.Active,
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            };
        } else {
            filter = {
                filter: {
                    groups: [
                        {
                            conditions: [
                                {
                                    custom: {
                                        search: {
                                            value: text,
                                        },
                                    },
                                },
                                {
                                    id: {
                                        equal: {
                                            value: '7083',
                                            not: true,
                                        },
                                    },
                                },
                                {
                                    status: {
                                        // status
                                        equal: {
                                            value: UserStatus.Active,
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            };
        }

        filter.pagination = {
            pageSize: 5,
            pageIndex: 0,
        };
        filter.sorting = [
            {
                field: UserSortingField.firstName,
                order: SortingOrder.ASC,
            },
            {
                field: UserSortingField.lastName,
                order: SortingOrder.ASC,
            },
        ];

        const variables = new NaturalQueryVariablesManager<UsersQueryVariables>();
        variables.set('variables', filter);

        this.getAll(variables).subscribe(result => {
            //    console.log("getUsersList(): ", result);
            createSearchEntries(result.items);
        });
    }

    public getOwnerLicenses(_owner: {id: string}): void {
        this.getOne(_owner.id).subscribe(result => {
            //            console.log("getOwnerLicenses(): ", result);
            const owner = {...result};
            Cahier.setOwnerLicenses(owner);
        });
    }
}
