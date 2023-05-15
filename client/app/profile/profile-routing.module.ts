import {NgModule} from '@angular/core';
import {Route, RouterModule, Routes} from '@angular/router';
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
import {
    createApplication,
    description,
    price,
    readOnlyName,
    availability,
} from '../admin/bookables/bookables/parent.component';
import {BookableService} from '../admin/bookables/services/bookable.service';

const storageRoute: Route = {
    component: UsageBookablesComponent,
    data: {
        forcedVariables: BookableService.bookableByTag(
            BookableTagService.STORAGE_REQUEST,
            [BookingType.application],
            true,
        ),
        availableColumns: [readOnlyName, description, price, createApplication],
        showFullyBooked: false,
        showPending: true,
        hideTableFooter: true,
        actionButtonLabel: 'Demander',
    },
};

export const servicesTabRoutes: Routes = [
    {
        ...storageRoute,
        path: '', // Need this route so that we can show some content on /admin/user/123#services, without the user needing to click on a tab
    },
    {
        ...storageRoute,
        path: 'bookables/storage', // Need this (duplicated) route to be coherent with URLs of other services tabs
    },
    {
        path: 'bookables/services',
        component: UsageBookablesComponent,
        data: {
            forcedVariables: BookableService.bookableByTag(BookableTagService.SERVICE, [BookingType.application], true),
            availableColumns: [readOnlyName, price, createApplication],
            showFullyBooked: false,
            showPending: true,
            hideTableFooter: true,
            actionButtonLabel: 'Demander',
        },
    },
    {
        path: 'bookables/survey',
        component: UsageBookablesComponent,
        data: {
            forcedVariables: BookableService.bookableByTag(BookableTagService.SURVEY, [BookingType.application], true),
            availableColumns: [readOnlyName, createApplication],
            showFullyBooked: false,
            showPending: true,
            hideTableFooter: true,
            actionButtonLabel: 'Voter',
            denyDoubleBooking: true,
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
            availableColumns: [readOnlyName, price, description, availability, createApplication],
            showFullyBooked: true,
            showPending: true,
            hideTableFooter: true,
            actionButtonLabel: "Demande d'inscription",
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
            availableColumns: [readOnlyName, availability, createApplication],
            showFullyBooked: true,
            showPending: true,
            hideTableFooter: true,
            actionButtonLabel: "Demande d'inscription",
        },
    },
    {
        path: 'bookables/nft',
        component: UsageBookablesComponent,
        data: {
            forcedVariables: BookableService.bookableByTag(
                BookableTagService.NFT,
                [BookingType.admin_approved, BookingType.application],
                true,
            ),
            availableColumns: [readOnlyName, description, availability, price, createApplication],
            showFullyBooked: true,
            showPending: true,
            hideTableFooter: true,
            actionButtonLabel: "Demande d'inscription",
        },
    },
];

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
                            seo: {title: 'Famille'} satisfies NaturalSeo,
                        },
                    },
                    {
                        path: 'history',
                        component: HistoryComponent,
                        data: {
                            seo: {title: 'Historique des transactions'} satisfies NaturalSeo,
                        },
                    },
                    {
                        path: 'finances',
                        component: FinancesComponent,
                        data: {
                            seo: {
                                title: 'Finances',
                            } satisfies NaturalSeo,
                        },
                    },
                    {
                        path: 'services',
                        component: ServicesComponent,
                        canActivate: [ServicesGuard],
                        resolve: {futureOwner: ViewerResolver},
                        data: {
                            seo: {title: ''} satisfies NaturalSeo,
                            hideCreateFab: true,
                        },
                        children: [...servicesTabRoutes],
                    },
                ],
            },
            {
                path: 'create-expense-claim',
                component: CreateExpenseClaimComponent,
                data: {
                    seo: {
                        title: 'Annoncer une dépense',
                    } satisfies NaturalSeo,
                    type: ExpenseClaimType.expenseClaim,
                },
            },
            {
                path: 'create-invoice',
                component: CreateExpenseClaimComponent,
                data: {
                    seo: {
                        title: 'Annoncer une facture à payer',
                    } satisfies NaturalSeo,
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
