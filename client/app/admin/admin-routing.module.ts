import {Route, Routes} from '@angular/router';
import {AdminComponent} from './admin/admin.component';
import {BookablesComponent} from './bookables/bookables/bookables.component';
import {BookableComponent} from './bookables/bookable/bookable.component';
import {resolveLicense} from './licenses/services/license.resolver';
import {resolveBookable} from './bookables/services/bookable.resolver';
import {LicensesComponent} from './licenses/licenses/licenses.component';
import {LicenseComponent} from './licenses/license/license.component';
import {UserTagsComponent} from './userTags/userTags/userTags.component';
import {UserTagComponent} from './userTags/userTag/userTag.component';
import {resolveUserTag} from './userTags/services/userTag.resolver';
import {BookingsComponent} from './bookings/bookings/bookings.component';
import {UsersComponent} from './users/users/users.component';
import {UserComponent} from './users/user/user.component';
import {resolveUser} from './users/services/user.resolver';
import {BookingComponent} from './bookings/booking/booking.component';
import {bookingResolvers} from './bookings/services/booking.resolver';
import {BookingService} from './bookings/services/booking.service';
import {UserService} from './users/services/user.service';
import {BookableService} from './bookables/services/bookable.service';
import {BookableTagsComponent} from './bookableTags/bookableTags/bookableTags.component';
import {BookableTagComponent} from './bookableTags/bookableTag/bookableTag.component';
import {resolveBookableTag} from './bookableTags/services/bookableTag.resolver';
import {
    BookableSortingField,
    ExpenseClaimSortingField,
    ExpenseClaimsVariables,
    SortingOrder,
    TransactionLineSortingField,
    UserRole,
    UserStatus,
} from '../shared/generated-types';
import {resolveDuplicatedTransaction, resolveTransaction} from './transactions/services/transaction.resolver';
import {TransactionComponent} from './transactions/transaction/transaction.component';
import {canActivateAdministration} from '../shared/guards/administration.guard';
import {canActivateAccounting} from '../shared/guards/accounting.guard';
import {canActivateBookable} from '../shared/guards/bookable.guard';
import {AccountComponent} from './accounts/account/account.component';
import {AccountsComponent} from './accounts/accounts/accounts.component';
import {resolveAccount} from './accounts/services/account.resolver';
import {SupportComponent} from './configurations/support/support.component';
import {ExpenseClaimsComponent} from './expenseClaim/expenseClaims/expenseClaims.component';
import {ExpenseClaimComponent} from './expenseClaim/expenseClaim/expenseClaim.component';
import {resolveExpenseClaim} from './expenseClaim/services/expenseClaim.resolver';
import {TransactionTagsComponent} from './transactionTags/transactionTags/transactionTags.component';
import {TransactionTagComponent} from './transactionTags/transactionTag/transactionTag.component';
import {resolveTransactionTag} from './transactionTags/services/transactionTag-resolver.service';
import {TransactionLinesComponent} from './transactions/transactionLines/transactionLines.component';
import {resolveExpenseClaimParam} from './expenseClaim/services/expenseClaim.param.resolver';
import {ImportComponent} from './import/import.component';
import {LogsComponent} from './logs/logs/logs.component';
import {BookableTagService} from './bookableTags/services/bookableTag.service';
import {merge} from 'es-toolkit';
import {UsageBookablesComponent} from './bookables/bookables/usage-bookables.component';
import {BookingsWithOwnerComponent} from './bookings/bookings/bookings-with-owner.component';
import {NaturalSeo} from '@ecodev/natural';
import {
    availableColumnsForBookingsBooking,
    availableColumnsForBookingsLive,
    availableColumnsForBookingsSelfApproved,
    availableColumnsForBookingsServicesApplication,
    availableColumnsForBookingsStorageApplication,
    availableColumnsForBookingsWithOwnerApplications,
} from './bookings/bookings/abstract-bookings';
import {servicesTabRoutes} from '../profile/profile-routing.module';

function equipment(path: string, title: string, bookableTagId: string): Route {
    return {
        path: path,
        component: BookablesComponent,
        data: {
            seo: {
                title: title,
            } satisfies NaturalSeo,
            isEquipment: true,
            forcedVariables: BookableService.getFiltersByTagId(bookableTagId),
            selectedColumns: ['image', 'name', 'code', 'updateDate', 'verificationDate'],
        },
    };
}

export const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        canActivate: [canActivateAdministration],
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
                            availableColumns: availableColumnsForBookingsWithOwnerApplications,
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
                            availableColumns: availableColumnsForBookingsWithOwnerApplications,
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
                            availableColumns: availableColumnsForBookingsWithOwnerApplications,
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
                            ...bookingResolvers,
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
                            ...bookingResolvers,
                        },
                        data: {
                            seo: {resolve: true} satisfies NaturalSeo,
                        },
                    },
                ],
            },
            {
                path: 'bookable', // Separated from other similar routes because of https://github.com/angular/angular/issues/27674
                component: UsageBookablesComponent,
                canActivate: [canActivateBookable],
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
                    equipment('sup', 'Stand up paddle', '6000'),
                    equipment('planche', 'Planches', '6001'),
                    equipment('canoe', 'Canoës', '6002'),
                    equipment('kayak', 'Kayaks', '6003'),
                    equipment('aviron', 'Aviron', '6004'),
                    equipment('voile-legere', 'Voile légère', '6005'),
                    equipment('voile-lestee', 'Voile lestée', '6006'),
                    equipment('wing-foil', 'Wing foil', '6043'),
                    equipment('bateau-moteur', 'Bateau moteur', '6038'),
                    {
                        path: 'armoire',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: 'Armoires',
                            } satisfies NaturalSeo,
                            selectedColumns: ['image', 'name', 'code', 'updateDate', 'verificationDate', 'usage'],
                            forcedVariables: BookableService.bookableByTag('6009'),
                            facetsKey: 'storage',
                        },
                    },
                    {
                        path: 'formation',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: 'Cours',
                            } satisfies NaturalSeo,
                            hideTableFooter: true,
                            selectedColumns: ['name', 'code', 'initialPrice', 'owner', 'usageStatus'],
                            forcedVariables: merge(BookableService.bookableByTag(BookableTagService.FORMATION), {
                                sorting: [{field: BookableSortingField.creationDate, order: SortingOrder.DESC}],
                            }),
                            facetsKey: 'admin_approved',
                        },
                    },
                    {
                        path: 'nft',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: 'NFT',
                            } as NaturalSeo,
                            hideTableFooter: true,
                            selectedColumns: ['name', 'code', 'updateDate', 'initialPrice', 'usageStatus'],
                            forcedVariables: merge(BookableService.bookableByTag(BookableTagService.NFT), {
                                sorting: [{field: BookableSortingField.creationDate, order: SortingOrder.DESC}],
                            }),
                            facetsKey: 'admin_approved',
                        },
                    },
                    {
                        path: 'welcome',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: "Séances d'accueil",
                            } satisfies NaturalSeo,
                            hideTableFooter: true,
                            selectedColumns: ['name', 'updateDate', 'usageStatus'],
                            forcedVariables: merge(BookableService.bookableByTag(BookableTagService.WELCOME), {
                                sorting: [{field: BookableSortingField.creationDate, order: SortingOrder.DESC}],
                            }),
                            facetsKey: 'admin_approved',
                        },
                    },
                    {
                        path: 'casier',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: 'Casiers',
                            } satisfies NaturalSeo,
                            selectedColumns: ['image', 'name', 'code', 'updateDate', 'verificationDate', 'usage'],
                            forcedVariables: BookableService.bookableByTag('6010'),
                            facetsKey: 'storage',
                        },
                    },
                    {
                        path: 'flotteur',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: 'Flotteurs',
                            } satisfies NaturalSeo,
                            selectedColumns: ['image', 'name', 'code', 'updateDate', 'verificationDate', 'usage'],
                            forcedVariables: BookableService.bookableByTag('6011'),
                            facetsKey: 'storage',
                        },
                    },
                    {
                        path: 'ratelier',
                        component: UsageBookablesComponent,
                        data: {
                            seo: {
                                title: 'Râteliers WB',
                            } satisfies NaturalSeo,
                            selectedColumns: ['image', 'name', 'code', 'updateDate', 'verificationDate', 'usage'],
                            forcedVariables: BookableService.bookableByTag('6016'),
                            facetsKey: 'storage',
                        },
                    },
                    {
                        path: 'new',
                        component: BookableComponent,
                        resolve: {
                            model: resolveBookable,
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
                            model: resolveBookable,
                        },
                        data: {
                            seo: {resolve: true} satisfies NaturalSeo,
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
                            forcedVariables: UserService.getFilters([UserRole.member], [UserStatus.Active]),
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
                            forcedVariables: UserService.getFilters([UserRole.member], [UserStatus.New]),
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
                                [UserStatus.Inactive, UserStatus.Archived],
                            ),
                            selectedColumns: ['balance', 'name', 'status', 'creationDate', 'resignDate'],
                        },
                    },
                    {
                        path: 'new',
                        component: UserComponent,
                        resolve: {
                            model: resolveUser,
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
                            model: resolveUser,
                        },
                        data: {
                            seo: {resolve: true} satisfies NaturalSeo,
                            persistSearchUsageBookable: false,
                        },
                        children: servicesTabRoutes,
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
                            model: resolveLicense,
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
                            model: resolveLicense,
                        },
                        data: {
                            seo: {resolve: true} satisfies NaturalSeo,
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
                            model: resolveUserTag,
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
                            model: resolveUserTag,
                        },
                        data: {
                            seo: {resolve: true} satisfies NaturalSeo,
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
                            model: resolveBookableTag,
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
                            model: resolveBookableTag,
                        },
                        data: {
                            seo: {resolve: true} satisfies NaturalSeo,
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
                            model: resolveTransaction,
                            duplicatedTransaction: resolveDuplicatedTransaction,
                            expenseClaim: resolveExpenseClaimParam,
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
                            model: resolveTransaction,
                        },
                        data: {
                            seo: {resolve: true} satisfies NaturalSeo,
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
                canActivate: [canActivateAccounting],
                data: {
                    seo: {
                        title: 'Comptes',
                    } satisfies NaturalSeo,
                },
            },
            {
                path: 'account',
                canActivate: [canActivateAccounting],
                children: [
                    {
                        path: 'new',
                        component: AccountComponent,
                        resolve: {
                            model: resolveAccount,
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
                            model: resolveAccount,
                        },
                        data: {
                            seo: {resolve: true} satisfies NaturalSeo,
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
                    selectedColumns: ['name', 'owner', 'updateDate', 'status', 'type', 'amount'],
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
                            model: resolveExpenseClaim,
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
                            model: resolveExpenseClaim,
                        },
                        data: {
                            seo: {resolve: true} satisfies NaturalSeo,
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
                            model: resolveTransactionTag,
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
                            model: resolveTransactionTag,
                        },
                        data: {
                            seo: {resolve: true} satisfies NaturalSeo,
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
