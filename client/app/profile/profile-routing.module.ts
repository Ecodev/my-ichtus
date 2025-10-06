import {Route, Routes} from '@angular/router';
import {resolveViewer} from '../admin/users/services/viewer.resolver';
import {ProfileComponent} from './components/profile/profile.component';
import {FamilyComponent} from './components/family/family.component';
import {BookingHistoryComponent} from './components/booking-history/booking-history.component';
import {FinancesComponent} from './components/finances/finances.component';
import {ServicesComponent} from './components/services/services.component';
import {CreateExpenseClaimComponent} from './components/create-expense-claim/create-expense-claim.component';
import {HistoryComponent} from './components/history/history.component';
import {canActivateServices} from '../shared/guards/services.guard';
import {NaturalSeo} from '@ecodev/natural';
import {BookingType, ExpenseClaimType} from '../shared/generated-types';
import {BookableTagService} from '../admin/bookableTags/services/bookableTag.service';
import {UsageBookablesComponent} from '../admin/bookables/bookables/usage-bookables.component';
import {
    availability,
    createApplication,
    description,
    price,
    readOnlyName,
} from '../admin/bookables/bookables/parent.component';
import {BookableService} from '../admin/bookables/services/bookable.service';
import {resolveExpenseClaim} from '../admin/expenseClaim/services/expenseClaim.resolver';
import {FormationsComponent} from './components/formation/formations/formations.component';
import {FormationComponent} from './components/formation/formation/formation.component';

function formation(path: string, bookableTagId?: string): Route {
    return {
        path: path,
        component: FormationsComponent,
        data: {
            forcedVariables: BookableService.formationBookable(bookableTagId),
        },
    };
}

const storageRoute: Route = {
    component: UsageBookablesComponent,
    data: {
        forcedVariables: BookableService.bookableByTag(
            BookableTagService.STORAGE_REQUEST,
            [BookingType.Application],
            true,
        ),
        availableColumns: [readOnlyName, description, price, createApplication],
        hideTableFooter: true,
        showColumnPicker: false,
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
            forcedVariables: BookableService.bookableByTag(BookableTagService.SERVICE, [BookingType.Application], true),
            availableColumns: [readOnlyName, price, createApplication],
            hideTableFooter: true,
            showColumnPicker: false,
            actionButtonLabel: 'Demander',
        },
    },
    {
        path: 'bookables/survey',
        component: UsageBookablesComponent,
        data: {
            forcedVariables: BookableService.bookableByTag(BookableTagService.SURVEY, [BookingType.Application], true),
            availableColumns: [readOnlyName, createApplication],
            hideTableFooter: true,
            showColumnPicker: false,
            actionButtonLabel: 'Voter',
            denyDoubleBooking: true,
        },
    },
    {
        path: 'bookables/welcome',
        component: UsageBookablesComponent,
        data: {
            forcedVariables: BookableService.bookableByTag(
                BookableTagService.WELCOME,
                [BookingType.AdminApproved, BookingType.Application],
                true,
            ),
            availableColumns: [readOnlyName, availability, createApplication],
            hideTableFooter: true,
            showColumnPicker: false,
            actionButtonLabel: "Demande d'inscription",
        },
    },
    {
        path: 'bookables/nft',
        component: UsageBookablesComponent,
        data: {
            forcedVariables: BookableService.bookableByTag(
                BookableTagService.NFT,
                [BookingType.AdminApproved, BookingType.Application],
                true,
            ),
            availableColumns: [readOnlyName, description, availability, price, createApplication],
            hideTableFooter: true,
            showColumnPicker: false,
            actionButtonLabel: "Demande d'inscription",
        },
    },
];

export const routes: Routes = [
    {
        path: 'services/bookables/formation',
        component: ProfileComponent,
        data: {
            hideHeader: true,
        },
        children: [
            {
                path: '',
                component: FormationComponent,
                canActivate: [canActivateServices],
                resolve: {futureOwner: resolveViewer},
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'all',
                    },
                    formation('all'),
                    formation('sup', '6040'),
                    formation('planche', '6034'),
                    formation('aviron', '6023'),
                    formation('laser', '6032'),
                    formation('catamaran', '6033'),
                    formation('wing-foil', '6045'),
                    formation('surprise', '6039'),
                ],
            },
        ],
    },
    {
        path: '',
        resolve: {viewer: resolveViewer},
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
                        canActivate: [canActivateServices],
                        resolve: {futureOwner: resolveViewer},
                        data: {
                            seo: {title: ''} satisfies NaturalSeo,
                            hideCreateFab: true,
                        },
                        children: servicesTabRoutes,
                    },
                ],
            },
            {
                path: 'create-expense-claim',
                component: CreateExpenseClaimComponent,
                resolve: {
                    model: resolveExpenseClaim,
                },
                data: {
                    seo: {
                        title: 'Annoncer une dépense',
                    } satisfies NaturalSeo,
                    type: ExpenseClaimType.ExpenseClaim,
                },
            },
            {
                path: 'create-invoice',
                component: CreateExpenseClaimComponent,
                resolve: {
                    model: resolveExpenseClaim,
                },
                data: {
                    seo: {
                        title: 'Annoncer une facture à payer',
                    } satisfies NaturalSeo,
                    type: ExpenseClaimType.Invoice,
                },
            },
        ],
    },
];
