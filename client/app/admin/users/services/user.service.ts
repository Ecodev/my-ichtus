import {Injectable} from '@angular/core';
import {FormControl, ValidationErrors, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {
    FormAsyncValidators,
    FormValidators,
    Literal,
    NaturalAbstractModelService,
    NaturalQueryVariablesManager,
    unique,
} from '@ecodev/natural';
import {Apollo} from 'apollo-angular';
import {Observable, of, Subject} from 'rxjs';
import {DataProxy} from 'apollo-cache';
import {map} from 'rxjs/operators';
import {
    createUser,
    currentUserForProfileQuery,
    leaveFamilyMutation,
    loginMutation,
    logoutMutation,
    unregisterMutation,
    updateUser,
    userByTokenQuery,
    userQuery,
    usersQuery,
} from './user.queries';
import {
    BillingType,
    Bookings,
    BookingStatus,
    BookingsVariables,
    BookingType,
    CreateUser,
    CreateUserVariables,
    CurrentUserForProfile,
    LeaveFamily,
    LeaveFamilyVariables,
    LogicalOperator,
    Login,
    LoginVariables,
    Logout,
    Relationship,
    RequestPasswordReset,
    RequestPasswordResetVariables,
    Sex,
    SortingOrder,
    Unregister,
    UnregisterVariables,
    UpdateUser,
    UpdateUserVariables,
    User,
    User_user,
    UserByToken,
    UserByTokenVariables,
    UserInput,
    UserPartialInput,
    UserRole,
    Users,
    UserSortingField,
    UserStatus,
    UsersVariables,
    UserVariables,
} from '../../../shared/generated-types';
import {BookingService} from '../../bookings/services/booking.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import gql from 'graphql-tag';
import {PricedBookingService} from '../../bookings/services/PricedBooking.service';

export function loginValidator(control: FormControl): ValidationErrors | null {
    const value = control.value || '';
    if (value && !value.match(/^[a-zA-Z0-9\\.-]+$/)) {
        return {
            invalid: 'Le login doit contenir seulement des lettres, chiffres, "." et "-"',
        };
    }

    return null;
}

@Injectable({
    providedIn: 'root',
})
export class UserService extends NaturalAbstractModelService<
    User['user'],
    UserVariables,
    Users['users'],
    UsersVariables,
    CreateUser['createUser'],
    CreateUserVariables,
    UpdateUser['updateUser'],
    UpdateUserVariables,
    any
> {
    /**
     * Should be used only by getViewer and cacheViewer
     */
    private viewerCache: CurrentUserForProfile['viewer'] | null = null;

    constructor(
        apollo: Apollo,
        protected router: Router,
        protected bookingService: BookingService,
        private permissionsService: PermissionsService,
        protected pricedBookingService: PricedBookingService,
    ) {
        super(apollo, 'user', userQuery, usersQuery, createUser, updateUser, null);
    }

    /**
     * Return filters for users for given roles and statuses
     */
    public static getFilters(roles: UserRole[], statuses: UserStatus[] | null): UsersVariables {
        return {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                role: roles && roles.length ? {in: {values: roles}} : null,
                                status: statuses ? {in: {values: statuses}} : null,
                            },
                        ],
                    },
                ],
            },
        };
    }

    public static canAccessServices(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }
        return !user.owner;
    }

    public static canAccessAdmin(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }
        return [UserRole.responsible, UserRole.administrator].includes(user.role);
    }

    public static canAccessDoor(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }
        return user.canOpenDoor;
    }

    public static getFamilyVariables(user): UsersVariables {
        const familyBoss = user.owner || user;

        return {
            filter: {
                groups: [
                    {conditions: [{id: {equal: {value: familyBoss.id}}}]},
                    {
                        groupLogic: LogicalOperator.OR,
                        conditions: [{owner: {equal: {value: familyBoss.id}}}],
                    },
                ],
            },
            sorting: [{field: UserSortingField.birthday, order: SortingOrder.ASC}],
        };
    }

    protected getDefaultForServer(): UserInput {
        return {
            login: '',
            email: null,
            firstName: '',
            lastName: '',
            birthday: null,
            street: '',
            postcode: '',
            locality: '',
            country: null,
            status: UserStatus.new,
            role: UserRole.member,
            familyRelationship: Relationship.householder,
            swissSailing: '',
            swissSailingType: null,
            swissWindsurfType: null,
            mobilePhone: '',
            phone: '',
            door1: false,
            door2: false,
            door3: false,
            door4: false,
            billingType: BillingType.electronic,
            remarks: '',
            internalRemarks: '',
            owner: null,
            sex: Sex.not_known,
            welcomeSessionDate: null,
            iban: '',
            hasInsurance: false,
            receivesNewsletter: true,
        };
    }

    protected getDefaultForClient(): Literal {
        return {
            country: {id: 1, name: 'Suisse'},
        };
    }

    public getFormValidators(): FormValidators {
        return {
            login: [Validators.required, loginValidator],
            firstName: [Validators.required, Validators.maxLength(100)],
            lastName: [Validators.required, Validators.maxLength(100)],
            email: [Validators.email],
            familyRelationship: [Validators.required],
            birthday: [Validators.required],
        };
    }

    public getFormAsyncValidators(model: User_user): FormAsyncValidators {
        return {
            login: [unique('login', model.id, this)],
            email: [unique('email', model.id, this)],
        };
    }

    public getFormConfig(model: Literal): Literal {
        const config = super.getFormConfig(model);

        // Inject extra form control for the account which is strictly read-only
        const formState = {
            value: model.account,
            disabled: true,
        };
        config.account = new FormControl(formState);

        return config;
    }

    public login(loginData: LoginVariables): Observable<Login['login']> {
        const subject = new Subject<Login['login']>();

        // Be sure to destroy all Apollo data, before changing user
        (this.apollo.getClient().resetStore() as Promise<null>).then(() => {
            this.apollo
                .mutate<Login, LoginVariables>({
                    mutation: loginMutation,
                    variables: loginData,
                    update: (proxy: DataProxy, result) => {
                        const login = (result.data as Login).login;
                        this.cacheViewer(login);

                        // Inject the freshly logged in user as the current user into Apollo data store
                        const data = {viewer: login};
                        proxy.writeQuery({
                            query: currentUserForProfileQuery,
                            data,
                        });
                        this.permissionsService.setUser(login);
                    },
                })
                .pipe(map(result => (result.data as Login).login))
                .subscribe(subject);
        });

        return subject;
    }

    public flagWelcomeSessionDate(id: string, value = new Date().toISOString()) {
        const user: UserPartialInput = {welcomeSessionDate: value};
        return this.updatePartially({id: id, ...user});
    }

    public activate(id: string) {
        const user: UserPartialInput = {status: UserStatus.active};
        return this.updatePartially({id: id, ...user});
    }

    public logout(): Observable<Logout['logout']> {
        const subject = new Subject<Logout['logout']>();

        this.router.navigate(['/login'], {queryParams: {logout: true}}).then(() => {
            this.apollo
                .mutate<Logout>({
                    mutation: logoutMutation,
                })
                .subscribe(result => {
                    const v = (result.data as Logout).logout;
                    this.cacheViewer(null);
                    (this.apollo.getClient().resetStore() as Promise<null>).then(() => {
                        subject.next(v);
                    });
                });
        });

        return subject;
    }

    /**
     * Impact members
     */
    public getRunningServices(user, expire: Subject<void>): Observable<Bookings['bookings']> {
        const variables: BookingsVariables = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                owner: {equal: {value: user.id}},
                                status: {equal: {value: BookingStatus.booked}},
                                endDate: {null: {}},
                            },
                        ],
                        joins: {
                            bookable: {
                                conditions: [
                                    {
                                        bookingType: {
                                            in: {
                                                values: [BookingType.self_approved],
                                                not: true,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
        };

        const qvm = new NaturalQueryVariablesManager<BookingsVariables>();
        qvm.set('variables', variables);
        return this.pricedBookingService.watchAll(qvm, expire);
    }

    public getPendingApplications(user, expire: Subject<void>): Observable<Bookings['bookings']> {
        const variables: BookingsVariables = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                endDate: {null: {}},
                                owner: {equal: {value: user.id}},
                                status: {equal: {value: BookingStatus.application}},
                            },
                        ],
                        joins: {bookable: {conditions: [{bookingType: {in: {values: [BookingType.admin_approved]}}}]}},
                    },
                ],
            },
        };

        const qvm = new NaturalQueryVariablesManager<BookingsVariables>();
        qvm.set('variables', variables);
        return this.bookingService.watchAll(qvm, expire);
    }

    public getViewer(): Observable<CurrentUserForProfile['viewer']> {
        if (this.viewerCache) {
            return of(this.viewerCache);
        }

        return this.apollo
            .query<CurrentUserForProfile>({
                query: currentUserForProfileQuery,
            })
            .pipe(
                map(result => {
                    this.cacheViewer(result.data.viewer);
                    return result.data.viewer;
                }),
            );
    }

    /**
     * This function caches the viewer for short duration
     *
     * This feature responds to two needs :
     *   - Expire viewer to allow re-resolve for key pages
     *     - Profile : in cache status or account balance has change
     *     - Doors : in case permissions have changed
     *     - Admin : in cache permissions have changed
     *
     *   - Serve from cache to prevent duplicate query calls when multiple services initialization queue (preventing batching):
     *     - Route Guards, then
     *     - Resolvers, then
     *     - Components initialization
     *
     * This is kind of easiest possible "debounce" like with expiration feature
     */
    private cacheViewer(user) {
        this.viewerCache = user;
        setTimeout(() => {
            this.viewerCache = null;
        }, 1000);
    }

    /**
     * Resolve items related to users, and the user if the id is provided, in order to show a form
     */
    public resolveViewer(): Observable<{model: CurrentUserForProfile['viewer']}> {
        return this.getViewer().pipe(
            map(result => {
                return {model: result};
            }),
        );
    }

    public resolveByToken(token: string): Observable<{model: UserByToken['userByToken']}> {
        return this.apollo
            .query<UserByToken, UserByTokenVariables>({
                query: userByTokenQuery,
                variables: {
                    token: token,
                },
            })
            .pipe(
                map(result => {
                    return {model: result.data.userByToken};
                }),
            );
    }

    public unregister(user): Observable<Unregister['unregister']> {
        return this.apollo
            .mutate<Unregister, UnregisterVariables>({
                mutation: unregisterMutation,
                variables: {
                    id: user.id,
                },
            })
            .pipe(map(result => (result.data as Unregister).unregister));
    }

    public leaveFamily(user): Observable<LeaveFamily['leaveFamily']> {
        return this.apollo
            .mutate<LeaveFamily, LeaveFamilyVariables>({
                mutation: leaveFamilyMutation,
                variables: {
                    id: user.id,
                },
            })
            .pipe(map(result => (result.data as LeaveFamily).leaveFamily));
    }

    /**
     * Can leave home if has an owner
     */
    public canLeaveFamily(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }

        return !!user.owner && user.owner.id !== user.id;
    }

    /**
     * Can become a member has no owner and is not member
     */
    public canBecomeMember(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }

        const isMember = [UserRole.member, UserRole.responsible, UserRole.administrator].indexOf(user.role) > -1;

        return !isMember && !this.canLeaveFamily(user);
    }

    public canUpdateTransaction(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }
        return user.role === UserRole.administrator;
    }

    public canDeleteAccountingDocument(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }
        return user.role === UserRole.administrator;
    }

    public requestPasswordReset(login: string): Observable<RequestPasswordReset['requestPasswordReset']> {
        const mutation = gql`
            mutation RequestPasswordReset($login: Login!) {
                requestPasswordReset(login: $login)
            }
        `;

        return this.apollo
            .mutate<RequestPasswordReset, RequestPasswordResetVariables>({
                mutation: mutation,
                variables: {
                    login: login,
                },
            })
            .pipe(map(result => (result.data as RequestPasswordReset).requestPasswordReset));
    }
}
