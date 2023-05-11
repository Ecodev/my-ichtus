import {Apollo, gql} from 'apollo-angular';
import {Inject, Injectable, OnDestroy} from '@angular/core';
import {UntypedFormControl, ValidationErrors, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {
    deliverableEmail,
    FormAsyncValidators,
    formatIsoDateTime,
    FormValidators,
    Literal,
    LOCAL_STORAGE,
    NaturalAbstractModelService,
    NaturalDebounceService,
    NaturalQueryVariablesManager,
    NaturalStorage,
    unique,
} from '@ecodev/natural';
import {fromEvent, Observable, of, Subject} from 'rxjs';
import {map, switchMap, takeUntil, tap} from 'rxjs/operators';
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
    userRolesAvailableQuery,
    usersQuery,
} from './user.queries';
import {
    BillingType,
    Bookings,
    BookingStatus,
    BookingsVariables,
    BookingType,
    ConfirmRegistration,
    ConfirmRegistrationVariables,
    CreateUser,
    CreateUserVariables,
    CurrentUserForProfile,
    CurrentUserForProfile_viewer,
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
    UpdateUser_updateUser,
    UpdateUserVariables,
    User,
    User_user,
    UserByToken,
    UserByTokenVariables,
    UserInput,
    UserLeaveFamily,
    UserLoginAvailable,
    UserLoginAvailableVariables,
    UserPartialInput,
    UserRole,
    UserRolesAvailables,
    UserRolesAvailablesVariables,
    Users,
    UserSortingField,
    UserStatus,
    UsersVariables,
    UserVariables,
} from '../../../shared/generated-types';
import {BookingService} from '../../bookings/services/booking.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {PricedBookingService} from '../../bookings/services/PricedBooking.service';

export function loginValidator(control: UntypedFormControl): ValidationErrors | null {
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
export class UserService
    extends NaturalAbstractModelService<
        User['user'],
        UserVariables,
        Users['users'],
        UsersVariables,
        CreateUser['createUser'],
        CreateUserVariables,
        UpdateUser['updateUser'],
        UpdateUserVariables,
        never,
        never
    >
    implements OnDestroy
{
    /**
     * Should be used only by getViewer and cacheViewer
     */
    private viewerCache: CurrentUserForProfile_viewer | null = null;

    /**
     * This key will be used to store the viewer ID, but that value should never
     * be trusted, and it only exist to notify changes across browser tabs.
     */
    private readonly storageKey = 'viewer';
    private readonly onDestroy = new Subject<void>();

    public constructor(
        apollo: Apollo,
        naturalDebounceService: NaturalDebounceService,
        protected readonly router: Router,
        protected readonly bookingService: BookingService,
        private readonly permissionsService: PermissionsService,
        protected readonly pricedBookingService: PricedBookingService,
        @Inject(LOCAL_STORAGE) private readonly storage: NaturalStorage,
    ) {
        super(apollo, naturalDebounceService, 'user', userQuery, usersQuery, createUser, updateUser, null);
        this.keepViewerSyncedAcrossBrowserTabs();
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

    public static getFamilyVariables(user: CurrentUserForProfile_viewer): UsersVariables {
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
            sorting: [
                {field: UserSortingField.birthday, order: SortingOrder.ASC},
                {field: UserSortingField.firstName, order: SortingOrder.ASC},
            ],
        };
    }

    protected override getDefaultForServer(): UserInput {
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

    protected override getDefaultForClient(): Literal {
        return {
            country: {id: 1, name: 'Suisse'},
        };
    }

    public override getFormValidators(): FormValidators {
        return {
            login: [Validators.required, loginValidator],
            firstName: [Validators.required, Validators.maxLength(100)],
            lastName: [Validators.required, Validators.maxLength(100)],
            email: [deliverableEmail],
            familyRelationship: [Validators.required],
            birthday: [Validators.required],
        };
    }

    public override getFormAsyncValidators(model: User_user): FormAsyncValidators {
        return {
            login: [unique('login', model.id, this)],
            email: [unique('email', model.id, this)],
        };
    }

    public override getFormConfig(model: Literal): Literal {
        const config = super.getFormConfig(model);

        // Inject extra form control for the account which is strictly read-only
        const formState = {
            value: model.account,
            disabled: true,
        };
        config.account = new UntypedFormControl(formState);

        return config;
    }

    public ngOnDestroy(): void {
        this.onDestroy.next();
        this.onDestroy.complete();
    }

    private keepViewerSyncedAcrossBrowserTabs(): void {
        fromEvent<StorageEvent>(window, 'storage')
            .pipe(takeUntil(this.onDestroy))
            .subscribe(event => {
                if (event.key !== this.storageKey) {
                    return;
                }

                // Don't do anything if the event comes from the current browser tab
                if (window.document.hasFocus()) {
                    return;
                }

                this.refetchViewerAndGoToHome().subscribe();
            });
    }

    private refetchViewerAndGoToHome(): Observable<unknown> {
        this.viewerCache = null;
        return this.getViewer().pipe(
            tap(viewer => {
                if (viewer) {
                    this.apollo.client.resetStore().then(() => {
                        this.postLogin(viewer);

                        // Navigate away from login page
                        this.router.navigateByUrl('/');
                    });
                } else {
                    this.logout();
                }
            }),
        );
    }

    public login(loginData: LoginVariables): Observable<Login['login']> {
        const subject = new Subject<Login['login']>();

        // Be sure to destroy all Apollo data, before changing user
        this.apollo.client.resetStore().then(() => {
            this.apollo
                .mutate<Login, LoginVariables>({
                    mutation: loginMutation,
                    variables: loginData,
                })
                .pipe(
                    map(result => {
                        const viewer = result.data!.login;
                        this.postLogin(viewer);

                        return viewer;
                    }),
                )
                .subscribe(subject);
        });

        return subject;
    }

    public confirmRegistration(variables: ConfirmRegistrationVariables): Observable<unknown> {
        const mutation = gql`
            mutation ConfirmRegistration($token: Token!, $input: ConfirmRegistrationInput!) {
                confirmRegistration(token: $token, input: $input)
            }
        `;

        return this.apollo
            .mutate<ConfirmRegistration, ConfirmRegistrationVariables>({
                mutation: mutation,
                variables: variables,
            })
            .pipe(switchMap(() => this.refetchViewerAndGoToHome()));
    }

    private postLogin(viewer: CurrentUserForProfile_viewer): void {
        this.cacheViewer(viewer);

        // Inject the freshly logged in user as the current user into Apollo data store
        const data = {viewer: viewer};
        this.apollo.client.writeQuery<CurrentUserForProfile, never>({
            query: currentUserForProfileQuery,
            data,
        });

        this.permissionsService.setUser(viewer);

        // Broadcast viewer to other browser tabs
        this.storage.setItem(this.storageKey, viewer.id);
    }

    public loginAvailable(login: string, excludedId: string | null): Observable<boolean> {
        const query = gql`
            query UserLoginAvailable($login: String!, $excluded: UserID) {
                userLoginAvailable(login: $login, excluded: $excluded)
            }
        `;

        return this.apollo
            .query<UserLoginAvailable, UserLoginAvailableVariables>({
                query: query,
                variables: {
                    login: login,
                    excluded: excludedId,
                },
                fetchPolicy: 'network-only',
            })
            .pipe(map(result => result.data.userLoginAvailable));
    }

    public flagWelcomeSessionDate(
        id: string,
        value = formatIsoDateTime(new Date()),
    ): Observable<UpdateUser_updateUser> {
        const user: UserPartialInput = {welcomeSessionDate: value};
        return this.updatePartially({id: id, ...user});
    }

    public activate(id: string): Observable<UpdateUser_updateUser> {
        const user: UserPartialInput = {status: UserStatus.active};
        return this.updatePartially({id: id, ...user});
    }

    public logout(): Observable<Logout['logout']> {
        const subject = new Subject<Logout['logout']>();

        this.naturalDebounceService
            .flush()
            .pipe(
                switchMap(() => this.router.navigate(['/login'], {queryParams: {logout: true}})),
                switchMap(() =>
                    this.apollo.mutate<Logout>({
                        mutation: logoutMutation,
                    }),
                ),
            )
            .subscribe(result => {
                const v = result.data!.logout;
                this.cacheViewer(null);

                // Broadcast logout to other browser tabs
                this.storage.setItem(this.storageKey, '');

                this.apollo.client.resetStore().then(() => {
                    subject.next(v);
                    subject.complete();
                });
            });

        return subject;
    }

    /**
     * Impact members
     */
    public getRunningServices(user: CurrentUserForProfile_viewer): Observable<Bookings['bookings']> {
        const variables: BookingsVariables = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                owner: {equal: {value: user.id}},
                                status: {in: {values: [BookingStatus.booked, BookingStatus.processed]}},
                                endDate: {null: {}},
                            },
                        ],
                        joins: {
                            bookable: {
                                conditions: [
                                    {
                                        bookingType: {
                                            in: {
                                                values: [BookingType.application, BookingType.self_approved],
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
        return this.pricedBookingService.watchAll(qvm);
    }

    public getPendingApplications(user: CurrentUserForProfile_viewer | User_user): Observable<Bookings['bookings']> {
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
                        joins: {
                            bookable: {
                                conditions: [
                                    {
                                        bookingType: {
                                            in: {values: [BookingType.application, BookingType.admin_approved]},
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
        return this.bookingService.watchAll(qvm);
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

    public getUserRolesAvailable(user: User_user | null): Observable<UserRole[]> {
        return this.apollo
            .query<UserRolesAvailables, UserRolesAvailablesVariables>({
                query: userRolesAvailableQuery,
                variables: {
                    user: user?.id,
                },
            })
            .pipe(
                map(result => {
                    return result.data.userRolesAvailable;
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
    private cacheViewer(user: CurrentUserForProfile_viewer | null): void {
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

    public unregister(user: CurrentUserForProfile_viewer): Observable<Unregister['unregister']> {
        return this.apollo
            .mutate<Unregister, UnregisterVariables>({
                mutation: unregisterMutation,
                variables: {
                    id: user.id,
                },
            })
            .pipe(map(result => result.data!.unregister));
    }

    public leaveFamily(user: UserLeaveFamily): Observable<LeaveFamily['leaveFamily']> {
        return this.apollo
            .mutate<LeaveFamily, LeaveFamilyVariables>({
                mutation: leaveFamilyMutation,
                variables: {
                    id: user.id,
                },
            })
            .pipe(map(result => result.data!.leaveFamily));
    }

    /**
     * Can leave home if has an owner
     */
    public canLeaveFamily(user: UserLeaveFamily | null): boolean {
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

        const isMember = [UserRole.member, UserRole.trainer, UserRole.responsible, UserRole.administrator].includes(
            user.role,
        );

        return !isMember && !this.canLeaveFamily(user);
    }

    public canUpdateTransaction(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }
        return user.role === UserRole.administrator;
    }

    public canUpdateIban(user: CurrentUserForProfile['viewer']): boolean {
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

    public canCloseAccounting(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }
        return user.role === UserRole.administrator;
    }

    public requestPasswordReset(login: string): Observable<RequestPasswordReset['requestPasswordReset']> {
        const mutation = gql`
            mutation RequestPasswordReset($login: String!) {
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
            .pipe(map(result => result.data!.requestPasswordReset));
    }
}
