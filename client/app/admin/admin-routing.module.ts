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
    BookableSortingField,
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
import {
    availableColumnsForBookingsBooking,
    availableColumnsForBookingsLive,
    availableColumnsForBookingsSelfApproved,
    availableColumnsForBookingsServicesApplication,
    availableColumnsForBookingsStorageApplication,
    availableColumnsForBookingsWithOwnerFormationApplication,
    availableColumnsForBookingsWithOwnerNftApplication,
    availableColumnsForBookingsWithOwnerWelcomeApplication,
} from './bookings/bookings/abstract-bookings';
import {servicesTabRoutes} from '../profile/profile-routing.module';

const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        canActivate: [AdministrationGuard],
        data: {isAdmin: true},
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'live',
            },
            {
                path: 'live',
                component: BookingsComponent,
                data: {
                    seo: {
                        title: 'Sorties en cours',
                    } satisfies NaturalSeo,
                    forcedVariables: BookingService.runningSelfApprovedQV,
                    selectedColumns: [
                        'edit',
                        'owner',
                        'bookable',
                        'destination',
                        'startDate',
                        'estimatedEndDate',
                        'participantCount',
                        'terminateBooking',
                    ],
                    availableColumns: availableColumnsForBookingsLive,
                },
            },
            {
                path: 'booking', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: BookingsComponent,
                data: {
                    seo: {
                        title: 'Réservations',
                    } satisfies NaturalSeo,
                    selectedColumns: ['edit', 'owner', 'bookable', 'startDate', 'endDate', 'endComment'],
                    availableColumns: availableColumnsForBookingsBooking,
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
                            } satisfies NaturalSeo,
                            forcedVariables: BookingService.selfApprovedQV,
                            selectedColumns: [
                                'edit',
                                'owner',
                                'bookable',
                                'destination',
                                'startDate',
                                'endDate',
                                'participantCount',
                                'endComment',
                            ],
                            availableColumns: availableColumnsForBookingsSelfApproved,
                        },
                    },
                    {
                        path: 'storage-application',
                        component: BookingsComponent,
                        data: {
                            seo: {
                                title: 'Demandes de stockage en attente',
                            } satisfies NaturalSeo,
                            forcedVariables: BookingService.applicationByTag(BookableTagService.STORAGE_REQUEST),
                            selectedColumns: ['edit', 'owner', 'bookable', 'startDate'],
                            availableColumns: availableColumnsForBookingsStorageApplication,
                        },
                    },
                    {
                        path: 'formation-application',
                        component: BookingsWithOwnerComponent,
                        data: {
                            seo: {
                                title: 'Demandes de cours',
                            } satisfies NaturalSeo,
                            forcedVariables: BookingService.applicationByTag(BookableTagService.FORMATION),
                            availableColumns: availableColumnsForBookingsWithOwnerFormationApplication,
                        },
                    },
                    {
                        path: 'nft-application',
                        component: BookingsWithOwnerComponent,
                        data: {
                            seo: {
                                title: 'Demandes NFT',
                            } as NaturalSeo,
                            forcedVariables: BookingService.applicationByTag(BookableTagService.NFT),
                            availableColumns: availableColumnsForBookingsWithOwnerNftApplication,
                        },
                    },
                    {
                        path: 'welcome-application',
                        component: BookingsWithOwnerComponent,
                        data: {
                            seo: {
                                title: "Demandes de séances d'accueil",
                            } satisfies NaturalSeo,
                            forcedVariables: BookingService.applicationByTag(BookableTagService.WELCOME),
                            availableColumns: availableColumnsForBookingsWithOwnerWelcomeApplication,
                        },
                    },
                    {
                        path: 'services-application',
                        component: BookingsComponent,
                        data: {
                            seo: {
                                title: 'Demandes de services en attente',
                            } satisfies NaturalSeo,
                            forcedVariables: BookingService.servicesApplication,
                            availableColumns: availableColumnsForBookingsServicesApplication,
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
                            } satisfies NaturalSeo,
                        },
                    },
                    {
                        path: ':bookingId', // last
                        component: BookingComponent,
                        resolve: {
                            booking: BookingResolver,
                        },
                        data: {
                            seo: {resolveKey: 'booking'} satisfies NaturalSeo,
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
                    } satisfies NaturalSeo,
                    selectedColumns: ['name', 'code', 'purchasePrice', 'initialPrice', 'periodicPrice', 'updateDate'],
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
                            } satisfies NaturalSeo,
                            forcedVariables: BookableService.membershipServices,
                        },
                    },
                    {
                        path: 'sup',
                        component: BookablesComponent,
                        data: {
                            seo: {
                                title: 'Stand up paddle',
                            } satisfies NaturalSeo,
                            isEquipment: true,
                            forcedVariables: BookableService.getFiltersByTagId('6000'),
                            selectedColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'planche',
                        component: BookablesComponent,
                        data: {
                            seo: {
                                title: 'Planches',
                            } satisfies NaturalSeo,
                            isEquipment: true,
                            forcedVariables: BookableService.getFiltersByTagId('6001'),
                            selectedColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'canoe',
                        component: BookablesComponent,
                        data: {
                            seo: {
                                title: 'Canoës',
                            } satisfies NaturalSeo,
                            isEquipment: true,
                            forcedVariables: BookableService.getFiltersByTagId('6002'),
                            selectedColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'kayak',
                        component: BookablesComponent,
                        data: {
                            seo: {
                                title: 'Kayaks',
                            } satisfies NaturalSeo,
                            isEquipment: true,
                            forcedVariables: BookableService.getFiltersByTagId('6003'),
                            selectedColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'aviron',
                        component: BookablesComponent,
                        data: {
                            seo: {
                                title: 'Aviron',
                            } satisfies NaturalSeo,
                            isEquipment: true,
                            forcedVariables: BookableService.getFiltersByTagId('6004'),
                            selectedColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'voile-legere',
                        component: BookablesComponent,
                        data: {
                            seo: {
                                title: 'Voile légère',
                            } satisfies NaturalSeo,
                            isEquipment: true,
                            forcedVariables: BookableService.getFiltersByTagId('6005'),
                            selectedColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'voile-lestee',
                        component: BookablesComponent,
                        data: {
                            seo: {
                                title: 'Voile lestée',
                            } satisfies NaturalSeo,
                            isEquipment: true,
                            forcedVariables: BookableService.getFiltersByTagId('6006'),
                            selectedColumns: ['image', 'name', 'code', 'date', 'verificationDate'],
                        },
                    },
                    {
                        path: 'armoire',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: 'Armoires',
                            } satisfies NaturalSeo,
                            selectedColumns: ['image', 'name', 'code', 'date', 'verificationDate', 'usage'],
                            forcedVariables: BookableService.bookableByTag('6009'),
                            isStorage: true,
                        },
                    },
                    {
                        path: 'formation',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: 'Cours',
                            } satisfies NaturalSeo,
                            selectedColumns: ['name', 'code', 'date', 'initialPrice', 'usageNb', 'verificationDate'],
                            forcedVariables: merge(BookableService.bookableByTag(BookableTagService.FORMATION), {
                                sorting: [{field: BookableSortingField.creationDate, order: SortingOrder.DESC}],
                            }),
                        },
                    },
                    {
                        path: 'nft',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: 'NFT',
                            } as NaturalSeo,
                            selectedColumns: ['name', 'code', 'date', 'initialPrice', 'usageNb', 'verificationDate'],
                            forcedVariables: merge(BookableService.bookableByTag(BookableTagService.NFT), {
                                sorting: [{field: BookableSortingField.creationDate, order: SortingOrder.DESC}],
                            }),
                        },
                    },
                    {
                        path: 'welcome',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: "Séances d'accueil",
                            } satisfies NaturalSeo,
                            selectedColumns: ['name', 'date', 'verificationDate', 'usageNb'],
                            forcedVariables: merge(BookableService.bookableByTag(BookableTagService.WELCOME), {
                                sorting: [{field: BookableSortingField.creationDate, order: SortingOrder.DESC}],
                            }),
                        },
                    },
                    {
                        path: 'casier',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: 'Casiers',
                            } satisfies NaturalSeo,
                            selectedColumns: ['image', 'name', 'code', 'date', 'verificationDate', 'usage'],
                            forcedVariables: BookableService.bookableByTag('6010'),
                            isStorage: true,
                        },
                    },
                    {
                        path: 'flotteur',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: 'Flotteurs',
                            } satisfies NaturalSeo,
                            selectedColumns: ['image', 'name', 'code', 'date', 'verificationDate', 'usage'],
                            forcedVariables: BookableService.bookableByTag('6011'),
                            isStorage: true,
                        },
                    },
                    {
                        path: 'ratelier',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: 'Râteliers WB',
                            } satisfies NaturalSeo,
                            selectedColumns: ['image', 'name', 'code', 'date', 'verificationDate', 'usage'],
                            forcedVariables: BookableService.bookableByTag('6016'),
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
                            } satisfies NaturalSeo,
                        },
                    },
                    {
                        path: ':bookableId', // last
                        component: BookableComponent,
                        resolve: {
                            bookable: BookableResolver,
                        },
                        data: {
                            seo: {resolveKey: 'bookable'} satisfies NaturalSeo,
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
                    } satisfies NaturalSeo,
                    selectedColumns: ['balance', 'name', 'login', 'age', 'status', 'flagWelcomeSessionDate'],
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
                            } satisfies NaturalSeo,
                            forcedVariables: UserService.getFilters([UserRole.member], [UserStatus.active]),
                            selectedColumns: ['balance', 'name', 'login', 'age', 'status', 'flagWelcomeSessionDate'],
                        },
                    },
                    {
                        path: 'newcomer',
                        component: UsersComponent,
                        data: {
                            seo: {
                                title: 'Nouveaux membres',
                            } satisfies NaturalSeo,
                            forcedVariables: UserService.getFilters([UserRole.member], [UserStatus.new]),
                            selectedColumns: ['balance', 'name', 'status', 'creationDate', 'flagWelcomeSessionDate'],
                        },
                    },
                    {
                        path: 'non-active',
                        component: UsersComponent,
                        data: {
                            seo: {
                                title: 'Membres inactifs et archivés',
                            } satisfies NaturalSeo,
                            forcedVariables: UserService.getFilters(
                                [UserRole.member],
                                [UserStatus.inactive, UserStatus.archived],
                            ),
                            selectedColumns: ['balance', 'name', 'status', 'creationDate', 'resignDate'],
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
                            } satisfies NaturalSeo,
                        },
                    },
                    {
                        path: ':userId', // last
                        component: UserComponent,
                        resolve: {
                            user: UserResolver,
                        },
                        data: {
                            seo: {resolveKey: 'user'} satisfies NaturalSeo,
                            persistSearchUsageBookable: false,
                        },
                        children: [
                            {
                                path: '',
                                pathMatch: 'full',
                                redirectTo: 'bookables/storage',
                            },
                            ...servicesTabRoutes,
                        ],
                    },
                ],
            },
            {
                path: 'license', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: LicensesComponent,
                data: {
                    seo: {
                        title: 'Certifications',
                    } satisfies NaturalSeo,
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
                            } satisfies NaturalSeo,
                        },
                    },
                    {
                        path: ':licenseId', // last
                        component: LicenseComponent,
                        resolve: {
                            license: LicenseResolver,
                        },
                        data: {
                            seo: {resolveKey: 'license'} satisfies NaturalSeo,
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
                    } satisfies NaturalSeo,
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
                            } satisfies NaturalSeo,
                        },
                    },
                    {
                        path: ':userTagId', // last
                        component: UserTagComponent,
                        resolve: {
                            userTag: UserTagResolver,
                        },
                        data: {
                            seo: {resolveKey: 'userTag'} satisfies NaturalSeo,
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
                    } satisfies NaturalSeo,
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
                            } satisfies NaturalSeo,
                        },
                    },
                    {
                        path: ':bookableTagId', // last
                        component: BookableTagComponent,
                        resolve: {
                            bookableTag: BookableTagResolver,
                        },
                        data: {
                            seo: {resolveKey: 'bookableTag'} satisfies NaturalSeo,
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
                            } satisfies NaturalSeo,
                        },
                    },
                    {
                        path: ':transactionId', // last
                        component: TransactionComponent,
                        resolve: {
                            transaction: TransactionResolver,
                        },
                        data: {
                            seo: {resolveKey: 'transaction'} satisfies NaturalSeo,
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
                    } satisfies NaturalSeo,
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
                    } satisfies NaturalSeo,
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
                            } satisfies NaturalSeo,
                        },
                    },
                    {
                        path: ':accountId', // last
                        component: AccountComponent,
                        resolve: {
                            account: AccountResolver,
                        },
                        data: {
                            seo: {resolveKey: 'account'} satisfies NaturalSeo,
                        },
                    },
                ],
            },
            {
                path: 'expense-claim', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: ExpenseClaimsComponent,
                data: {
                    seo: {
                        title: 'Notes de frais, remboursements et factures',
                    } satisfies NaturalSeo,
                    selectedColumns: ['name', 'owner', 'date', 'status', 'type', 'amount'],
                    forcedVariables: {
                        sorting: [
                            {field: ExpenseClaimSortingField.status, order: SortingOrder.ASC},
                            {field: ExpenseClaimSortingField.creationDate, order: SortingOrder.DESC},
                        ],
                    } satisfies ExpenseClaimsVariables,
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
                            } satisfies NaturalSeo,
                        },
                    },
                    {
                        path: ':expenseClaimId', // last
                        component: ExpenseClaimComponent,
                        resolve: {
                            expenseClaim: ExpenseClaimResolver,
                        },
                        data: {
                            seo: {resolveKey: 'expenseClaim'} satisfies NaturalSeo,
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
                    } satisfies NaturalSeo,
                },
            },
            {
                // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                path: 'transaction-tag',
                component: TransactionTagsComponent,
                data: {
                    seo: {
                        title: 'Tags',
                    } satisfies NaturalSeo,
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
                            } satisfies NaturalSeo,
                        },
                    },
                    {
                        path: ':transactionTagId', // last
                        component: TransactionTagComponent,
                        resolve: {
                            transactionTag: TransactionTagResolver,
                        },
                        data: {
                            seo: {resolveKey: 'transactionTag'} satisfies NaturalSeo,
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
                    } satisfies NaturalSeo,
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
