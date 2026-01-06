import {gql} from 'apollo-angular';
import {inject, Injectable, OnDestroy} from '@angular/core';
import {FormControl, ValidationErrors, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {
    deliverableEmail,
    FormAsyncValidators,
    formatIsoDateTime,
    FormControls,
    FormValidators,
    Literal,
    LOCAL_STORAGE,
    NaturalAbstractModelService,
    NaturalQueryVariablesManager,
    unique,
} from '@ecodev/natural';
import {fromEvent, Observable, of, Subject} from 'rxjs';
import {map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {
    createUser,
    currentUserForProfileQuery,
    deleteUsers,
    leaveFamilyMutation,
    loginMutation,
    logoutMutation,
    requestUserDeletion,
    unregisterMutation,
    updateUser,
    userByTokenQuery,
    userQuery,
    userRolesAvailableQuery,
    usersQuery,
} from './user.queries';
import {
    BillingType,
    BookingStatus,
    BookingType,
    ConfirmRegistration,
    ConfirmRegistrationVariables,
    CreateUser,
    CreateUserVariables,
    CurrentUserForProfileQuery,
    type DeleteUsers,
    type DeleteUsersVariables,
    LeaveFamily,
    LeaveFamilyVariables,
    LogicalOperator,
    Login,
    LoginVariables,
    Logout,
    PricedBookingsQuery,
    PricedBookingsQueryVariables,
    Relationship,
    RequestPasswordReset,
    RequestPasswordResetVariables,
    type RequestUserDeletion,
    type RequestUserDeletionVariables,
    Sex,
    SortingOrder,
    Unregister,
    UnregisterVariables,
    UpdateUser,
    UpdateUserVariables,
    UserByTokenQuery,
    UserByTokenQueryVariables,
    UserInput,
    UserLeaveFamily,
    UserLoginAvailableQuery,
    UserLoginAvailableQueryVariables,
    UserQuery,
    UserQueryVariables,
    UserRole,
    UserRolesAvailablesQuery,
    UserRolesAvailablesQueryVariables,
    UserSortingField,
    UsersQuery,
    UsersQueryVariables,
    UserStatus,
} from '../../../shared/generated-types';
import {PermissionsService} from '../../../shared/services/permissions.service';
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
export class UserService
    extends NaturalAbstractModelService<
        UserQuery['user'],
        UserQueryVariables,
        UsersQuery['users'],
        UsersQueryVariables,
        CreateUser['createUser'],
        CreateUserVariables,
        UpdateUser['updateUser'],
        UpdateUserVariables,
        DeleteUsers,
        DeleteUsersVariables
    >
    implements OnDestroy
{
    protected readonly router = inject(Router);
    private readonly permissionsService = inject(PermissionsService);
    private readonly storage = inject(LOCAL_STORAGE);
    protected readonly pricedBookingService = inject(PricedBookingService);

    /**
     * Should be used only by getViewer and cacheViewer
     */
    private viewerCache: CurrentUserForProfileQuery['viewer'] = null;

    /**
     * This key will be used to store the viewer ID, but that value should never
     * be trusted, and it only exists to notify changes across browser tabs.
     */
    private readonly storageKey = 'viewer';
    private readonly onDestroy = new Subject<void>();

    public constructor() {
        super('user', userQuery, usersQuery, createUser, updateUser, deleteUsers);
        this.keepViewerSyncedAcrossBrowserTabs();
    }

    /**
     * Return filters for users for given roles and statuses
     */
    public static getFilters(roles: UserRole[], statuses: UserStatus[] | null): UsersQueryVariables {
        return {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                role: roles?.length ? {in: {values: roles}} : null,
                                status: statuses ? {in: {values: statuses}} : null,
                            },
                        ],
                    },
                ],
            },
        };
    }

    public static getFamilyVariables(user: NonNullable<CurrentUserForProfileQuery['viewer']>): UsersQueryVariables {
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

    public override getDefaultForServer(): UserInput {
        return {
            login: '',
            email: null,
            firstName: '',
            lastName: '',
            birthday: null,
            street: '',
            postcode: '',
            locality: '',
            country: {id: 1, name: 'Suisse'},
            status: UserStatus.New,
            role: UserRole.member,
            familyRelationship: Relationship.Householder,
            swissSailing: '',
            swissSailingType: null,
            swissWindsurfType: null,
            mobilePhone: '',
            phone: '',
            door1: false,
            door2: false,
            door3: false,
            door4: false,
            billingType: BillingType.Electronic,
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

    public override getFormAsyncValidators(model: UserQuery['user']): FormAsyncValidators {
        return {
            login: [unique('login', model.id, this)],
            email: [unique('email', model.id, this)],
        };
    }

    public override getFormConfig(model: Literal): FormControls {
        const config = super.getFormConfig(model);

        // Inject extra form control for the account which is strictly read-only
        const formState = {
            value: model.account,
            disabled: true,
        };
        config.account = new FormControl(formState);

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

    private postLogin(viewer: NonNullable<CurrentUserForProfileQuery['viewer']>): void {
        this.cacheViewer(viewer);

        // Inject the freshly logged in user as the current user into Apollo data store
        const data = {viewer: viewer};
        this.apollo.client.writeQuery<CurrentUserForProfileQuery, never>({
            query: currentUserForProfileQuery,
            data,
        });

        this.permissionsService.setUser(viewer);

        // Broadcast viewer to other browser tabs
        this.storage.setItem(this.storageKey, viewer.id);
    }

    public loginAvailable(login: string, excludedId: string | null): Observable<boolean> {
        const query = gql`
            query UserLoginAvailableQuery($login: String!, $excluded: UserID) {
                userLoginAvailable(login: $login, excluded: $excluded)
            }
        `;

        return this.apollo
            .query<UserLoginAvailableQuery, UserLoginAvailableQueryVariables>({
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
    ): Observable<UpdateUser['updateUser']> {
        return this.updateNow({id: id, welcomeSessionDate: value});
    }

    public activate(id: string): Observable<UpdateUser['updateUser']> {
        return this.updateNow({id: id, status: UserStatus.Active});
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
    public getRunningServices(
        user: NonNullable<CurrentUserForProfileQuery['viewer']>,
        coursesOnly = false,
        excludeNFT = false,
    ): Observable<PricedBookingsQuery['bookings']> {
        const qvm = new NaturalQueryVariablesManager<PricedBookingsQueryVariables>();
        qvm.set('variables', {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                custom: {runningServices: {user: user.id, coursesOnly, excludeNFT}},
                            },
                        ],
                        joins: {
                            bookable: {},
                        },
                    },
                ],
            },
        });
        return this.pricedBookingService.watchAll(qvm);
    }

    public getPendingApplications(
        user: NonNullable<CurrentUserForProfileQuery['viewer']> | UserQuery['user'],
        bookingTypes: BookingType[] = [BookingType.Application, BookingType.AdminApproved],
    ): Observable<PricedBookingsQuery['bookings']> {
        const qvm = new NaturalQueryVariablesManager<PricedBookingsQueryVariables>();
        qvm.set('variables', {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                endDate: {null: {}},
                                owner: {equal: {value: user.id}},
                                status: {equal: {value: BookingStatus.Application}},
                            },
                        ],
                        joins: {
                            bookable: {
                                conditions: [
                                    {
                                        bookingType: {
                                            in: {values: bookingTypes},
                                        },
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
        });
        return this.pricedBookingService.watchAll(qvm);
    }

    public getViewer(): Observable<CurrentUserForProfileQuery['viewer']> {
        if (this.viewerCache) {
            return of(this.viewerCache);
        }

        return this.apollo
            .query<CurrentUserForProfileQuery>({
                query: currentUserForProfileQuery,
            })
            .pipe(
                map(result => {
                    this.cacheViewer(result.data.viewer);
                    return result.data.viewer;
                }),
            );
    }

    public getUserRolesAvailable(user: UserQuery['user'] | UserInput | null): Observable<UserRole[]> {
        return this.apollo
            .query<UserRolesAvailablesQuery, UserRolesAvailablesQueryVariables>({
                query: userRolesAvailableQuery,
                variables: {
                    user: user && 'id' in user ? user.id : undefined,
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
     *   - Serve from cache to prevent duplicate query calls when multiple services initialization queue (preventing
     * batching):
     *     - Route Guards, then
     *     - Resolvers, then
     *     - Components initialization
     *
     * This is kind of easiest possible "debounce" like with expiration feature
     */
    private cacheViewer(user: CurrentUserForProfileQuery['viewer']): void {
        this.viewerCache = user;
        setTimeout(() => {
            this.viewerCache = null;
        }, 1000);
    }

    public resolveByToken(token: string): Observable<UserByTokenQuery['userByToken']> {
        return this.apollo
            .query<UserByTokenQuery, UserByTokenQueryVariables>({
                query: userByTokenQuery,
                variables: {
                    token: token,
                },
            })
            .pipe(map(result => result.data.userByToken));
    }

    public unregister(user: NonNullable<CurrentUserForProfileQuery['viewer']>): Observable<Unregister['unregister']> {
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

    public requestUserDeletion(userId: string): Observable<RequestUserDeletion['requestUserDeletion']> {
        return this.apollo
            .mutate<RequestUserDeletion, RequestUserDeletionVariables>({
                mutation: requestUserDeletion,
                variables: {
                    id: userId,
                },
            })
            .pipe(map(result => result.data!.requestUserDeletion));
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
    public canBecomeMember(user: NonNullable<CurrentUserForProfileQuery['viewer']>): boolean {
        if (!user) {
            return false;
        }

        const isMember = [UserRole.member, UserRole.trainer, UserRole.responsible, UserRole.administrator].includes(
            user.role,
        );

        return !isMember && !this.canLeaveFamily(user);
    }

    public canUpdateTransaction(user: NonNullable<CurrentUserForProfileQuery['viewer']>): boolean {
        if (!user) {
            return false;
        }
        return user.role === UserRole.administrator;
    }

    public canUpdateIban(user: NonNullable<CurrentUserForProfileQuery['viewer']>): boolean {
        if (!user) {
            return false;
        }
        return user.role === UserRole.administrator;
    }

    public canDeleteAccountingDocument(user: NonNullable<CurrentUserForProfileQuery['viewer']>): boolean {
        if (!user) {
            return false;
        }
        return user.role === UserRole.administrator;
    }

    public canCloseAccounting(user: NonNullable<CurrentUserForProfileQuery['viewer']>): boolean {
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
