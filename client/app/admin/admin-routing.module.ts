import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from './admin/admin.component';
import {BookablesComponent} from './bookables/bookables/bookables.component';
import {BookableComponent} from './bookables/bookable/bookable.component';
import {LicenseResolver} from './licenses/services/license.resolver';
import {BookableResolver} from './bookables/services/bookable.resolver';
import {LicensesComponent} from './licenses/licenses/licenses.component';
import {LicenseComponent} from './licenses/license/license.component';
import {UserTagsComponent} from './userTags/userTags/userTags.component';
import {UserTagComponent} from './userTags/userTag/userTag.component';
import {UserTagResolver} from './userTags/services/userTag.resolver';
import {BookingsComponent} from './bookings/bookings/bookings.component';
import {UsersComponent} from './users/users/users.component';
import {UserComponent} from './users/user/user.component';
import {UserResolver} from './users/services/user.resolver';
import {BookingComponent} from './bookings/booking/booking.component';
import {BookingResolver} from './bookings/services/booking.resolver';
import {BookingService} from './bookings/services/booking.service';
import {UserService} from './users/services/user.service';
import {BookableService} from './bookables/services/bookable.service';
import {BookableTagsComponent} from './bookableTags/bookableTags/bookableTags.component';
import {BookableTagComponent} from './bookableTags/bookableTag/bookableTag.component';
import {BookableTagResolver} from './bookableTags/services/bookableTag.resolver';
import {
    BookingSortingField,
    ExpenseClaimSortingField,
    ExpenseClaimsVariables,
    SortingOrder,
    TransactionLineSortingField,
    UserRole,
    UserStatus,
} from '../shared/generated-types';
import {TransactionResolver} from './transactions/services/transaction.resolver';
import {TransactionComponent} from './transactions/transaction/transaction.component';
import {AdministrationGuard} from '../shared/guards/administration.guard';
import {AccountComponent} from './accounts/account/account.component';
import {AccountsComponent} from './accounts/accounts/accounts.component';
import {AccountResolver} from './accounts/services/account.resolver';
import {SupportComponent} from './configurations/support/support.component';
import {ExpenseClaimsComponent} from './expenseClaim/expenseClaims/expenseClaims.component';
import {ExpenseClaimComponent} from './expenseClaim/expenseClaim/expenseClaim.component';
import {ExpenseClaimResolver} from './expenseClaim/services/expenseClaim.resolver';
import {TransactionTagsComponent} from './transactionTags/transactionTags/transactionTags.component';
import {TransactionTagComponent} from './transactionTags/transactionTag/transactionTag.component';
import {TransactionTagResolver} from './transactionTags/services/transactionTag-resolver.service';
import {TransactionLinesComponent} from './transactions/transactionLines/transactionLines.component';
import {ExpenseClaimParamResolver} from './expenseClaim/services/expenseClaim.param.resolver';
import {UsageBookableService} from './bookables/services/usage-bookable.service';
import {ImportComponent} from './import/import.component';
import {LogsComponent} from './logs/logs/logs.component';
import {BookableTagService} from './bookableTags/services/bookableTag.service';
import {BookingWithOwnerService} from './bookings/services/booking-with-owner.service';
import {merge} from 'lodash';

const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        canActivate: [AdministrationGuard],
        children: [
            {
                path: '',
                component: BookingsComponent,
                data: {
                    title: 'Sorties en cours',
                    contextVariables: BookingService.runningSelfApprovedQV,
                    contextColumns: [
                        'edit',
                        'owner',
                        'bookable',
                        'startDate',
                        'estimatedEndDate',
                        'participantCount',
                        'terminateBooking',
                    ],
                },
            },
            {
                path: 'booking', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: BookingsComponent,
                data: {
                    title: 'Réservations',
                    contextColumns: [
                        'edit',
                        'owner',
                        'bookable',
                        'startDate',
                        'endDate',
                        'participantCount',
                        'endComment',
                        'terminateBooking',
                    ],
                },
            },
            {
                path: 'booking',
                children: [
                    {
                        path: 'self-approved',
                        component: BookingsComponent,
                        data: {
                            title: 'Toutes terminées',
                            contextVariables: BookingService.selfApprovedQV,
                            contextColumns: [
                                'edit',
                                'owner',
                                'bookable',
                                'destination',
                                'startDate',
                                'endDate',
                                'participantCount',
                                'endComment',
                            ],
                        },
                    },
                    {
                        path: 'storage-application',
                        component: BookingsComponent,
                        data: {
                            title: 'Demandes de stockage en attente',
                            contextVariables: BookingService.applicationByTag(BookableTagService.STORAGE),
                            contextColumns: ['edit', 'owner', 'bookable', 'startDate'],
                        },
                    },
                    {
                        path: 'formation-application',
                        component: BookingsComponent,
                        data: {
                            title: 'Demandes de cours',
                            contextService: BookingWithOwnerService,
                            contextVariables: BookingService.applicationByTag(BookableTagService.FORMATION),
                            contextColumns: [
                                'edit',
                                'owner',
                                'ownerBalance',
                                'ownerCreationDate',
                                'bookable',
                                'startDate',
                            ],
                        },
                    },
                    {
                        path: 'welcome-application',
                        component: BookingsComponent,
                        data: {
                            title: "Demandes de séances d'accueil",
                            contextService: BookingWithOwnerService,
                            contextVariables: BookingService.applicationByTag(BookableTagService.WELCOME),
                            contextColumns: ['edit', 'owner', 'ownerBalance', 'ownerCreationDate', 'startDate'],
                        },
                    },
                    {
                        path: 'other-application',
                        component: BookingsComponent,
                        data: {
                            title: 'Demandes de services en attente',
                            contextVariables: BookingService.notStorageApplication,
                            contextColumns: ['edit', 'owner', 'bookable', 'startDate'],
                        },
                    },
                    {
                        path: 'new',
                        component: BookingComponent,
                        resolve: {
                            booking: BookingResolver,
                        },
                    },
                    {
                        path: ':bookingId', // last
                        component: BookingComponent,
                        resolve: {
                            booking: BookingResolver,
                        },
                    },
                ],
            },
            {
                path: 'bookable', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: BookablesComponent,
                data: {title: 'Réservables'},
            },
            {
                path: 'bookable',
                children: [
                    {
                        path: 'services',
                        component: BookablesComponent,
                        data: {
                            title: 'Cotisations',
                            contextVariables: BookableService.membershipServices,
                        },
                    },
                    {
                        path: 'sup',
                        component: BookablesComponent,
                        data: {
                            title: 'Stand up paddle',
                            contextVariables: BookableService.getFiltersByTagId(6000),
                            contextColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'planche',
                        component: BookablesComponent,
                        data: {
                            title: 'Planches',
                            contextVariables: BookableService.getFiltersByTagId(6001),
                            contextColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'canoe',
                        component: BookablesComponent,
                        data: {
                            title: 'Canoës',
                            contextVariables: BookableService.getFiltersByTagId(6002),
                            contextColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'kayak',
                        component: BookablesComponent,
                        data: {
                            title: 'Kayaks',
                            contextVariables: BookableService.getFiltersByTagId(6003),
                            contextColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'aviron',
                        component: BookablesComponent,
                        data: {
                            title: 'Aviron',
                            contextVariables: BookableService.getFiltersByTagId(6004),
                            contextColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'voile-legere',
                        component: BookablesComponent,
                        data: {
                            title: 'Voile légère',
                            contextVariables: BookableService.getFiltersByTagId(6005),
                            contextColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'voile-lestee',
                        component: BookablesComponent,
                        data: {
                            title: 'Voile lestée',
                            contextVariables: BookableService.getFiltersByTagId(6006),
                            contextColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'armoire',
                        component: BookablesComponent,
                        data: {
                            title: 'Armoires',
                            contextColumns: ['image', 'name', 'code', 'date', 'verificationDate', 'usage'],
                            contextVariables: BookableService.adminByTag(6009),
                            contextService: UsageBookableService,
                            isStorage: true,
                        },
                    },
                    {
                        path: 'formation',
                        component: BookablesComponent,
                        data: {
                            title: 'Cours',
                            contextColumns: ['name', 'code', 'date', 'initialPrice', 'usageNb', 'verificationDate'],
                            contextVariables: merge(BookableService.adminByTag(BookableTagService.FORMATION), {
                                sorting: [{field: BookingSortingField.creationDate, order: SortingOrder.DESC}],
                            }),
                            contextService: UsageBookableService,
                        },
                    },
                    {
                        path: 'welcome',
                        component: BookablesComponent,
                        data: {
                            title: "Séances d'accueil",
                            contextColumns: ['name', 'date', 'verificationDate', 'usageNb'],
                            contextVariables: BookableService.adminByTag(BookableTagService.WELCOME),
                            contextService: UsageBookableService,
                        },
                    },
                    {
                        path: 'casier',
                        component: BookablesComponent,
                        data: {
                            title: 'Casiers',
                            contextVariables: BookableService.adminByTag(6010),
                            contextService: UsageBookableService,
                            isStorage: true,
                        },
                    },
                    {
                        path: 'flotteur',
                        component: BookablesComponent,
                        data: {
                            title: 'Flotteurs',
                            contextVariables: BookableService.adminByTag(6011),
                            contextService: UsageBookableService,
                            isStorage: true,
                        },
                    },
                    {
                        path: 'ratelier',
                        component: BookablesComponent,
                        data: {
                            title: 'Râteliers WBC',
                            contextVariables: BookableService.adminByTag(6016),
                            contextService: UsageBookableService,
                            isStorage: true,
                        },
                    },
                    {
                        path: 'new',
                        component: BookableComponent,
                        resolve: {
                            bookable: BookableResolver,
                        },
                    },
                    {
                        path: ':bookableId', // last
                        component: BookableComponent,
                        resolve: {
                            bookable: BookableResolver,
                        },
                    },
                ],
            },
            {
                path: 'user', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: UsersComponent,
                data: {
                    title: 'Tous les utilisateurs',
                    contextColumns: ['balance', 'name', 'login', 'age', 'status', 'flagWelcomeSessionDate'],
                },
            },
            {
                path: 'user',
                children: [
                    {
                        path: 'member',
                        component: UsersComponent,
                        data: {
                            title: 'Membres actifs',
                            contextVariables: UserService.getFilters([UserRole.member], [UserStatus.active]),
                            contextColumns: ['balance', 'name', 'login', 'age', 'status', 'flagWelcomeSessionDate'],
                        },
                    },
                    {
                        path: 'newcomer',
                        component: UsersComponent,
                        data: {
                            title: 'Nouveaux membres',
                            contextVariables: UserService.getFilters([UserRole.member], [UserStatus.new]),
                            contextColumns: ['balance', 'name', 'status', 'creationDate', 'flagWelcomeSessionDate'],
                        },
                    },
                    {
                        path: 'staff',
                        component: UsersComponent,
                        data: {
                            title: 'Staff',
                            contextVariables: UserService.getFilters(
                                [UserRole.responsible, UserRole.administrator],
                                null,
                            ),
                            contextColumns: ['balance', 'name', 'login', 'age', 'status', 'flagWelcomeSessionDate'],
                        },
                    },
                    {
                        path: 'non-active',
                        component: UsersComponent,
                        data: {
                            title: 'Membres inactifs et archivés',
                            contextVariables: UserService.getFilters(
                                [UserRole.member],
                                [UserStatus.inactive, UserStatus.archived],
                            ),
                            contextColumns: ['balance', 'name', 'status', 'creationDate', 'resignDate'],
                        },
                    },

                    {
                        path: 'new',
                        component: UserComponent,
                        resolve: {
                            user: UserResolver,
                        },
                    },
                    {
                        path: ':userId', // last
                        component: UserComponent,
                        resolve: {
                            user: UserResolver,
                        },
                    },
                ],
            },
            {
                path: 'license', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: LicensesComponent,
                data: {
                    title: 'Certifications',
                },
            },
            {
                path: 'license',
                children: [
                    {
                        path: 'new',
                        component: LicenseComponent,
                        resolve: {
                            license: LicenseResolver,
                        },
                    },
                    {
                        path: ':licenseId', // last
                        component: LicenseComponent,
                        resolve: {
                            license: LicenseResolver,
                        },
                    },
                ],
            },
            {
                path: 'user-tag', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: UserTagsComponent,
                data: {
                    title: "Tags d'utilisateurs",
                },
            },
            {
                path: 'user-tag',
                children: [
                    {
                        path: 'new',
                        component: UserTagComponent,
                        resolve: {
                            userTag: UserTagResolver,
                        },
                    },
                    {
                        path: ':userTagId', // last
                        component: UserTagComponent,
                        resolve: {
                            userTag: UserTagResolver,
                        },
                    },
                ],
            },
            {
                path: 'bookable-tag', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: BookableTagsComponent,
                data: {
                    title: 'Tags de réservables',
                },
            },
            {
                path: 'bookable-tag',
                children: [
                    {
                        path: 'new',
                        component: BookableTagComponent,
                        resolve: {
                            bookableTag: BookableTagResolver,
                        },
                    },
                    {
                        path: ':bookableTagId', // last
                        component: BookableTagComponent,
                        resolve: {
                            bookableTag: BookableTagResolver,
                        },
                    },
                ],
            },
            {
                path: 'transaction',
                children: [
                    {
                        path: 'new',
                        component: TransactionComponent,
                        resolve: {
                            transaction: TransactionResolver,
                            expenseClaim: ExpenseClaimParamResolver,
                        },
                    },
                    {
                        path: ':transactionId', // last
                        component: TransactionComponent,
                        resolve: {
                            transaction: TransactionResolver,
                        },
                    },
                ],
            },
            {
                path: 'transaction-line', // Separated from other similar routes because of
                // https://github.com/angular/angular/issues/27674
                component: TransactionLinesComponent,
                data: {
                    title: 'Écritures',
                    contextVariables: {
                        sorting: [
                            {
                                field: TransactionLineSortingField.creationDate,
                                order: SortingOrder.DESC,
                            },
                            {
                                field: TransactionLineSortingField.latestModification,
                                order: SortingOrder.DESC,
                            },
                        ],
                    },
                },
            },
            {
                path: 'account', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: AccountsComponent,
                data: {title: 'Comptes'},
            },
            {
                path: 'account',
                children: [
                    {
                        path: 'new',
                        component: AccountComponent,
                        resolve: {
                            account: AccountResolver,
                        },
                    },
                    {
                        path: ':accountId', // last
                        component: AccountComponent,
                        resolve: {
                            account: AccountResolver,
                        },
                    },
                ],
            },
            {
                path: 'expense-claim', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: ExpenseClaimsComponent,
                data: {
                    title: 'Notes de frais',
                    contextColumns: ['name', 'owner', 'date', 'status', 'type', 'amount'],
                    contextVariables: {
                        sorting: [
                            {field: ExpenseClaimSortingField.status, order: SortingOrder.ASC},
                            {field: ExpenseClaimSortingField.creationDate, order: SortingOrder.DESC},
                        ],
                    } as ExpenseClaimsVariables,
                },
            },
            {
                path: 'expense-claim',
                children: [
                    {
                        path: 'new',
                        component: ExpenseClaimComponent,
                        resolve: {
                            expenseClaim: ExpenseClaimResolver,
                        },
                    },
                    {
                        path: ':expenseClaimId', // last
                        component: ExpenseClaimComponent,
                        resolve: {
                            expenseClaim: ExpenseClaimResolver,
                        },
                    },
                ],
            },
            {
                path: 'import',
                component: ImportComponent,
                data: {title: 'Import des virements BVR'},
            },
            {
                // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                path: 'transaction-tag',
                component: TransactionTagsComponent,
                data: {title: 'Tags'},
            },
            {
                path: 'transaction-tag',
                children: [
                    {
                        path: 'new',
                        component: TransactionTagComponent,
                        resolve: {
                            transactionTag: TransactionTagResolver,
                        },
                    },
                    {
                        path: ':transactionTagId', // last
                        component: TransactionTagComponent,
                        resolve: {
                            transactionTag: TransactionTagResolver,
                        },
                    },
                ],
            },
            {
                path: 'support',
                component: SupportComponent,
                data: {
                    readonly: false,
                    configurationKey: 'support-text',
                },
            },
            {
                path: 'announcement',
                component: SupportComponent,
                data: {
                    readonly: false,
                    configurationKey: 'announcement-text',
                    activable: true,
                },
            },
            {
                path: 'log',
                component: LogsComponent,
                data: {
                    title: 'Activité',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule {}
