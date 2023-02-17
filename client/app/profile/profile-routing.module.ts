import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ViewerResolver} from '../admin/users/services/viewer.resolver';
import {ProfileComponent} from './components/profile/profile.component';
import {FamilyComponent} from './components/family/family.component';
import {BookingHistoryComponent} from './components/booking-history/booking-history.component';
import {FinancesComponent} from './components/finances/finances.component';
import {ServicesComponent} from './components/services/services.component';
import {CreateExpenseClaimComponent} from './components/create-expense-claim/create-expense-claim.component';
import {HistoryComponent} from './components/history/history.component';
import {ServicesGuard} from '../shared/guards/services.guard';
import {NaturalSeo} from '@ecodev/natural';
import {BookingType, ExpenseClaimType} from '../shared/generated-types';
import {BookableTagService} from '../admin/bookableTags/services/bookableTag.service';
import {UsageBookablesComponent} from '../admin/bookables/bookables/usage-bookables.component';
import {BookableService} from '../admin/bookables/services/bookable.service';

const routes: Routes = [
    {
        path: '',
        resolve: {viewer: ViewerResolver},
        children: [
            {
                path: '',
                component: ProfileComponent,
                children: [
                    {
                        path: '',
                        component: BookingHistoryComponent,
                    },
                    {
                        path: 'family',
                        component: FamilyComponent,
                        data: {
                            seo: {title: 'Famille'} as NaturalSeo,
                        },
                    },
                    {
                        path: 'history',
                        component: HistoryComponent,
                        data: {
                            seo: {title: 'Historique des transactions'} as NaturalSeo,
                        },
                    },
                    {
                        path: 'finances',
                        component: FinancesComponent,
                        data: {
                            seo: {
                                title: 'Finances',
                            } as NaturalSeo,
                        },
                    },
                    {
                        path: 'services',
                        component: ServicesComponent,
                        canActivate: [ServicesGuard],
                        data: {
                            seo: {
                                title: 'Cotisation et services',
                            } as NaturalSeo,
                        },
                        children: [
                            {
                                path: '',
                                pathMatch: 'full',
                                redirectTo: '/profile/services/bookables/storage',
                            },
                            {
                                path: 'bookables/storage',
                                component: UsageBookablesComponent,
                                data: {
                                    forcedVariables: BookableService.bookableByTag(
                                        BookableTagService.STORAGE_REQUEST,
                                        [BookingType.application],
                                        true,
                                    ),
                                    selectedColumns: ['select', 'name', 'description', 'price', 'selection'],
                                    availableColumns: ['select', 'name', 'description', 'price', 'selection'],
                                    seo: {title: ''} as NaturalSeo,
                                },
                            },
                            {
                                path: 'bookables/services',
                                component: UsageBookablesComponent,
                                data: {
                                    forcedVariables: BookableService.bookableByTag(
                                        BookableTagService.SERVICE,
                                        [BookingType.application],
                                        true,
                                    ),
                                    selectedColumns: ['select', 'name', 'price', 'description', 'selection'],
                                    availableColumns: ['select', 'name', 'price', 'description', 'selection'],
                                    seo: {title: ''} as NaturalSeo,
                                },
                            },
                            {
                                path: 'bookables/survey',
                                component: UsageBookablesComponent,
                                data: {
                                    forcedVariables: BookableService.bookableByTag(
                                        BookableTagService.SURVEY,
                                        [BookingType.application],
                                        true,
                                    ),
                                    selectedColumns: ['select', 'name', 'price', 'description', 'selection'],
                                    availableColumns: ['select', 'name', 'price', 'description', 'selection'],
                                    seo: {title: ''} as NaturalSeo,
                                },
                            },
                            {
                                path: 'bookables/formation',
                                component: UsageBookablesComponent,
                                data: {
                                    forcedVariables: BookableService.bookableByTag(
                                        BookableTagService.FORMATION,
                                        [BookingType.admin_approved, BookingType.application],
                                        true,
                                    ),
                                    selectedColumns: ['select', 'name', 'price', 'description', 'selection'],
                                    availableColumns: ['select', 'name', 'price', 'description', 'selection'],
                                    seo: {title: ''} as NaturalSeo,
                                },
                            },
                            {
                                path: 'bookables/welcome',
                                component: UsageBookablesComponent,
                                data: {
                                    forcedVariables: BookableService.bookableByTag(
                                        BookableTagService.WELCOME,
                                        [BookingType.admin_approved, BookingType.application],
                                        true,
                                    ),
                                    selectedColumns: ['select', 'name', 'price', 'description', 'selection'],
                                    availableColumns: ['select', 'name', 'price', 'description', 'selection'],
                                    seo: {title: ''} as NaturalSeo,
                                },
                            },
                        ],
                    },
                ],
            },
            {
                path: 'create-expense-claim',
                component: CreateExpenseClaimComponent,
                data: {
                    seo: {
                        title: 'Annoncer une dépense',
                    } as NaturalSeo,
                    type: ExpenseClaimType.expenseClaim,
                },
            },
            {
                path: 'create-invoice',
                component: CreateExpenseClaimComponent,
                data: {
                    seo: {
                        title: 'Annoncer une facture à payer',
                    } as NaturalSeo,
                    type: ExpenseClaimType.invoice,
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProfileRoutingModule {}
