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
                    },
                ],
            },
            {
                path: 'create-expense-claim',
                component: CreateExpenseClaimComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProfileRoutingModule {}
