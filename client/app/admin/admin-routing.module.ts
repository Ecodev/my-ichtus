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
import {AccountingGuard} from '../shared/guards/accounting.guard';
import {BookableGuard} from '../shared/guards/bookable.guard';
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
import {ImportComponent} from './import/import.component';
import {LogsComponent} from './logs/logs/logs.component';
import {BookableTagService} from './bookableTags/services/bookableTag.service';
import {merge} from 'lodash-es';
import {UsageBookablesComponent} from './bookables/bookables/usage-bookables.component';
import {BookingsWithOwnerComponent} from './bookings/bookings/bookings-with-owner.component';
import {NaturalSeo} from '@ecodev/natural';

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
                    seo: {
                        title: 'Sorties en cours',
                    } as NaturalSeo,
                    forcedVariables: BookingService.runningSelfApprovedQV,
                    initialColumns: [
                        'edit',
                        'owner',
                        'bookable',
                        'destination',
                        'startDate',
                        'estimatedEndDate',
                        'participantCount',
                        'terminateBooking',
                    ],
                    availableColumns: [
                        'edit',
                        'owner',
                        'bookable',
                        'destination',
                        'startDate',
                        'startComment',
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
                    seo: {
                        title: 'Réservations',
                    } as NaturalSeo,
                    initialColumns: ['edit', 'owner', 'bookable', 'startDate', 'endDate', 'endComment'],
                    availableColumns: [
                        'edit',
                        'owner',
                        'status',
                        'bookable',
                        'startDate',
                        'startComment',
                        'endDate',
                        'estimatedEndDate',
                        'participantCount',
                        'endComment',
                        'terminateBooking',
                    ],
                    advancedFacets: true,
                },
            },
            {
                path: 'booking',
                children: [
                    {
                        path: 'self-approved',
                        component: BookingsComponent,
                        data: {
                            seo: {
                                title: 'Toutes terminées',
                            } as NaturalSeo,
                            forcedVariables: BookingService.selfApprovedQV,
                            initialColumns: [
                                'edit',
                                'owner',
                                'bookable',
                                'destination',
                                'startDate',
                                'endDate',
                                'participantCount',
                                'endComment',
                            ],
                            availableColumns: [
                                'edit',
                                'owner',
                                'bookable',
                                'destination',
                                'startDate',
                                'startComment',
                                'endDate',
                                'estimatedEndDate',
                                'participantCount',
                                'endComment',
                            ],
                        },
                    },
                    {
                        path: 'storage-application',
                        component: BookingsComponent,
                        data: {
                            seo: {
                                title: 'Demandes de stockage en attente',
                            } as NaturalSeo,
                            forcedVariables: BookingService.applicationByTag(BookableTagService.STORAGE_REQUEST),
                            initialColumns: ['edit', 'owner', 'bookable', 'startDate'],
                            availableColumns: ['edit', 'owner', 'bookable', 'startDate', 'endDate', 'endComment'],
                        },
                    },
                    {
                        path: 'formation-application',
                        component: BookingsWithOwnerComponent,
                        data: {
                            seo: {
                                title: 'Demandes de cours',
                            } as NaturalSeo,
                            forcedVariables: BookingService.applicationByTag(BookableTagService.FORMATION),
                            initialColumns: [
                                'edit',
                                'owner',
                                'ownerBalance',
                                'ownerCreationDate',
                                'bookable',
                                'startDate',
                            ],
                            availableColumns: [
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
                        component: BookingsWithOwnerComponent,
                        data: {
                            seo: {
                                title: "Demandes de séances d'accueil",
                            } as NaturalSeo,
                            forcedVariables: BookingService.applicationByTag(BookableTagService.WELCOME),
                            initialColumns: ['edit', 'owner', 'ownerBalance', 'ownerCreationDate', 'startDate'],
                            availableColumns: ['edit', 'owner', 'ownerBalance', 'ownerCreationDate', 'startDate'],
                        },
                    },
                    {
                        path: 'other-application',
                        component: BookingsComponent,
                        data: {
                            seo: {
                                title: 'Demandes de services en attente',
                            } as NaturalSeo,
                            forcedVariables: BookingService.notStorageApplication,
                            initialColumns: ['edit', 'owner', 'bookable', 'startDate'],
                            availableColumns: ['edit', 'owner', 'bookable', 'startDate'],
                        },
                    },
                    {
                        path: 'new',
                        component: BookingComponent,
                        resolve: {
                            booking: BookingResolver,
                        },
                        data: {
                            seo: {
                                title: 'Nouvelle réservation',
                            } as NaturalSeo,
                        },
                    },
                    {
                        path: ':bookingId', // last
                        component: BookingComponent,
                        resolve: {
                            booking: BookingResolver,
                        },
                        data: {
                            seo: {resolveKey: 'booking'} as NaturalSeo,
                        },
                    },
                ],
            },
            {
                path: 'bookable', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: UsageBookablesComponent,
                canActivate: [BookableGuard],
                data: {
                    seo: {
                        title: 'Réservables',
                    } as NaturalSeo,
                    initialColumns: [
                        'name',
                        'code',
                        'purchasePrice',
                        'initialPrice',
                        'periodicPrice',
                        'latestModification',
                    ],
                },
            },
            {
                path: 'bookable',
                children: [
                    {
                        path: 'services',
                        component: BookablesComponent,
                        data: {
                            seo: {
                                title: 'Cotisations',
                            } as NaturalSeo,
                            forcedVariables: BookableService.membershipServices,
                        },
                    },
                    {
                        path: 'sup',
                        component: BookablesComponent,
                        data: {
                            seo: {
                                title: 'Stand up paddle',
                            } as NaturalSeo,
                            isEquipment: true,
                            forcedVariables: BookableService.getFiltersByTagId('6000'),
                            initialColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'planche',
                        component: BookablesComponent,
                        data: {
                            seo: {
                                title: 'Planches',
                            } as NaturalSeo,
                            isEquipment: true,
                            forcedVariables: BookableService.getFiltersByTagId('6001'),
                            initialColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'canoe',
                        component: BookablesComponent,
                        data: {
                            seo: {
                                title: 'Canoës',
                            } as NaturalSeo,
                            isEquipment: true,
                            forcedVariables: BookableService.getFiltersByTagId('6002'),
                            initialColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'kayak',
                        component: BookablesComponent,
                        data: {
                            seo: {
                                title: 'Kayaks',
                            } as NaturalSeo,
                            isEquipment: true,
                            forcedVariables: BookableService.getFiltersByTagId('6003'),
                            initialColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'aviron',
                        component: BookablesComponent,
                        data: {
                            seo: {
                                title: 'Aviron',
                            } as NaturalSeo,
                            isEquipment: true,
                            forcedVariables: BookableService.getFiltersByTagId('6004'),
                            initialColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'voile-legere',
                        component: BookablesComponent,
                        data: {
                            seo: {
                                title: 'Voile légère',
                            } as NaturalSeo,
                            isEquipment: true,
                            forcedVariables: BookableService.getFiltersByTagId('6005'),
                            initialColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'voile-lestee',
                        component: BookablesComponent,
                        data: {
                            seo: {
                                title: 'Voile lestée',
                            } as NaturalSeo,
                            isEquipment: true,
                            forcedVariables: BookableService.getFiltersByTagId('6006'),
                            initialColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'armoire',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: 'Armoires',
                            } as NaturalSeo,
                            initialColumns: ['image', 'name', 'code', 'date', 'verificationDate', 'usage'],
                            forcedVariables: BookableService.adminByTag('6009'),
                            isStorage: true,
                        },
                    },
                    {
                        path: 'formation',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: 'Cours',
                            } as NaturalSeo,
                            initialColumns: ['name', 'code', 'date', 'initialPrice', 'usageNb', 'verificationDate'],
                            forcedVariables: merge(BookableService.adminByTag(BookableTagService.FORMATION), {
                                sorting: [{field: BookingSortingField.creationDate, order: SortingOrder.DESC}],
                            }),
                        },
                    },
                    {
                        path: 'welcome',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: "Séances d'accueil",
                            } as NaturalSeo,
                            initialColumns: ['name', 'date', 'verificationDate', 'usageNb'],
                            forcedVariables: BookableService.adminByTag(BookableTagService.WELCOME),
                        },
                    },
                    {
                        path: 'casier',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: 'Casiers',
                            } as NaturalSeo,
                            forcedVariables: BookableService.adminByTag('6010'),
                            isStorage: true,
                        },
                    },
                    {
                        path: 'flotteur',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: 'Flotteurs',
                            } as NaturalSeo,
                            forcedVariables: BookableService.adminByTag('6011'),
                            isStorage: true,
                        },
                    },
                    {
                        path: 'ratelier',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: 'Râteliers WBC',
                            } as NaturalSeo,
                            forcedVariables: BookableService.adminByTag('6016'),
                            isStorage: true,
                        },
                    },
                    {
                        path: 'new',
                        component: BookableComponent,
                        resolve: {
                            bookable: BookableResolver,
                        },
                        data: {
                            seo: {
                                title: 'Nouveau réservable',
                            } as NaturalSeo,
                        },
                    },
                    {
                        path: ':bookableId', // last
                        component: BookableComponent,
                        resolve: {
                            bookable: BookableResolver,
                        },
                        data: {
                            seo: {resolveKey: 'bookable'} as NaturalSeo,
                        },
                    },
                ],
            },
            {
                path: 'user', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: UsersComponent,
                data: {
                    seo: {
                        title: 'Tous les utilisateurs',
                    } as NaturalSeo,
                    initialColumns: ['balance', 'name', 'login', 'age', 'status', 'flagWelcomeSessionDate'],
                },
            },
            {
                path: 'user',
                children: [
                    {
                        path: 'member',
                        component: UsersComponent,
                        data: {
                            seo: {
                                title: 'Membres actifs',
                            } as NaturalSeo,
                            forcedVariables: UserService.getFilters([UserRole.member], [UserStatus.active]),
                            initialColumns: ['balance', 'name', 'login', 'age', 'status', 'flagWelcomeSessionDate'],
                        },
                    },
                    {
                        path: 'newcomer',
                        component: UsersComponent,
                        data: {
                            seo: {
                                title: 'Nouveaux membres',
                            } as NaturalSeo,
                            forcedVariables: UserService.getFilters([UserRole.member], [UserStatus.new]),
                            initialColumns: ['balance', 'name', 'status', 'creationDate', 'flagWelcomeSessionDate'],
                        },
                    },
                    {
                        path: 'staff',
                        component: UsersComponent,
                        data: {
                            seo: {
                                title: 'Staff',
                            } as NaturalSeo,
                            forcedVariables: UserService.getFilters(
                                [UserRole.responsible, UserRole.administrator],
                                null,
                            ),
                            initialColumns: ['balance', 'name', 'login', 'age', 'status', 'flagWelcomeSessionDate'],
                        },
                    },
                    {
                        path: 'non-active',
                        component: UsersComponent,
                        data: {
                            seo: {
                                title: 'Membres inactifs et archivés',
                            } as NaturalSeo,
                            forcedVariables: UserService.getFilters(
                                [UserRole.member],
                                [UserStatus.inactive, UserStatus.archived],
                            ),
                            initialColumns: ['balance', 'name', 'status', 'creationDate', 'resignDate'],
                        },
                    },
                    {
                        path: 'new',
                        component: UserComponent,
                        resolve: {
                            user: UserResolver,
                        },
                        data: {
                            seo: {
                                title: 'Nouvel utilisateur',
                            } as NaturalSeo,
                        },
                    },
                    {
                        path: ':userId', // last
                        component: UserComponent,
                        resolve: {
                            user: UserResolver,
                        },
                        data: {
                            seo: {resolveKey: 'user'} as NaturalSeo,
                        },
                    },
                ],
            },
            {
                path: 'license', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: LicensesComponent,
                data: {
                    seo: {
                        title: 'Certifications',
                    } as NaturalSeo,
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
                        data: {
                            seo: {
                                title: 'Nouvelle certification',
                            } as NaturalSeo,
                        },
                    },
                    {
                        path: ':licenseId', // last
                        component: LicenseComponent,
                        resolve: {
                            license: LicenseResolver,
                        },
                        data: {
                            seo: {resolveKey: 'license'} as NaturalSeo,
                        },
                    },
                ],
            },
            {
                path: 'user-tag', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: UserTagsComponent,
                data: {
                    seo: {
                        title: "Tags d'utilisateurs",
                    } as NaturalSeo,
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
                        data: {
                            seo: {
                                title: "Nouveau tag d'utilisateur",
                            } as NaturalSeo,
                        },
                    },
                    {
                        path: ':userTagId', // last
                        component: UserTagComponent,
                        resolve: {
                            userTag: UserTagResolver,
                        },
                        data: {
                            seo: {resolveKey: 'userTag'} as NaturalSeo,
                        },
                    },
                ],
            },
            {
                path: 'bookable-tag', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: BookableTagsComponent,
                data: {
                    seo: {
                        title: 'Tags de réservables',
                    } as NaturalSeo,
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
                        data: {
                            seo: {
                                title: 'Nouveau tag de réservable',
                            } as NaturalSeo,
                        },
                    },
                    {
                        path: ':bookableTagId', // last
                        component: BookableTagComponent,
                        resolve: {
                            bookableTag: BookableTagResolver,
                        },
                        data: {
                            seo: {resolveKey: 'bookableTag'} as NaturalSeo,
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
                        data: {
                            seo: {
                                title: 'Nouvelle transaction',
                            } as NaturalSeo,
                        },
                    },
                    {
                        path: ':transactionId', // last
                        component: TransactionComponent,
                        resolve: {
                            transaction: TransactionResolver,
                        },
                        data: {
                            seo: {resolveKey: 'transaction'} as NaturalSeo,
                        },
                    },
                ],
            },
            {
                path: 'transaction-line', // Separated from other similar routes because of
                // https://github.com/angular/angular/issues/27674
                component: TransactionLinesComponent,
                data: {
                    seo: {
                        title: 'Écritures',
                    } as NaturalSeo,
                    forcedVariables: {
                        sorting: [
                            {
                                field: TransactionLineSortingField.creationDate,
                                order: SortingOrder.DESC,
                            },
                            {
                                field: TransactionLineSortingField.transactionDate,
                                order: SortingOrder.DESC,
                            },
                        ],
                    },
                },
            },
            {
                path: 'account', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: AccountsComponent,
                canActivate: [AccountingGuard],
                data: {
                    seo: {
                        title: 'Comptes',
                    } as NaturalSeo,
                },
            },
            {
                path: 'account',
                canActivate: [AccountingGuard],
                children: [
                    {
                        path: 'new',
                        component: AccountComponent,
                        resolve: {
                            account: AccountResolver,
                        },
                        data: {
                            seo: {
                                title: 'Nouveau compte',
                            } as NaturalSeo,
                        },
                    },
                    {
                        path: ':accountId', // last
                        component: AccountComponent,
                        resolve: {
                            account: AccountResolver,
                        },
                        data: {
                            seo: {resolveKey: 'account'} as NaturalSeo,
                        },
                    },
                ],
            },
            {
                path: 'expense-claim', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: ExpenseClaimsComponent,
                data: {
                    seo: {
                        title: 'Notes de frais',
                    } as NaturalSeo,
                    initialColumns: ['name', 'owner', 'date', 'status', 'type', 'amount'],
                    forcedVariables: {
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
                        data: {
                            seo: {
                                title: 'Nouvelle note de frais',
                            } as NaturalSeo,
                        },
                    },
                    {
                        path: ':expenseClaimId', // last
                        component: ExpenseClaimComponent,
                        resolve: {
                            expenseClaim: ExpenseClaimResolver,
                        },
                        data: {
                            seo: {resolveKey: 'expenseClaim'} as NaturalSeo,
                        },
                    },
                ],
            },
            {
                path: 'import',
                component: ImportComponent,
                data: {
                    seo: {
                        title: 'Import des virements BVR',
                    } as NaturalSeo,
                },
            },
            {
                // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                path: 'transaction-tag',
                component: TransactionTagsComponent,
                data: {
                    seo: {
                        title: 'Tags',
                    } as NaturalSeo,
                },
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
                        data: {
                            seo: {
                                title: 'Nouveau tag de transaction',
                            } as NaturalSeo,
                        },
                    },
                    {
                        path: ':transactionTagId', // last
                        component: TransactionTagComponent,
                        resolve: {
                            transactionTag: TransactionTagResolver,
                        },
                        data: {
                            seo: {resolveKey: 'transactionTag'} as NaturalSeo,
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
                    seo: {
                        title: 'Activité',
                    } as NaturalSeo,
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
