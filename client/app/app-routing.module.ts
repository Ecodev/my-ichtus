import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SupportComponent, SupportComponentData} from './admin/configurations/support/support.component';
import {resolveViewer} from './admin/users/services/viewer.resolver';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {DoorComponent} from './door/door.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {ErrorComponent} from './shared/components/error/error.component';
import {SafetyComponent} from './safety/safety.component';
import {BookingService} from './admin/bookings/services/booking.service';
import {canActivateAuth} from './shared/guards/auth.guard';
import {canActivateDoor} from './shared/guards/door.guard';
import {NaturalDialogTriggerComponent, NaturalDialogTriggerRoutingData, NaturalSeo} from '@ecodev/natural';
import {availableColumnsForSafety} from './admin/bookings/bookings/abstract-bookings';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        resolve: {viewer: resolveViewer},
    },
    {
        // Registration
        path: 'user',
        component: HomeComponent,
        loadChildren: () => import('./user/user.module').then(m => m.UserModule),
    },
    {
        path: 'safety',
        component: SafetyComponent,
        data: {
            seo: {
                title: 'Sorties en cours',
            } satisfies NaturalSeo,
            forcedVariables: BookingService.runningSelfApprovedQV,
            selectedColumns: ['bookable', 'destination', 'startDate', 'estimatedEndDate', 'participantCount'],
            availableColumns: availableColumnsForSafety,
        },
    },
    // Auth required routes
    {
        path: '',
        component: HomeComponent,
        resolve: {viewer: resolveViewer},
        canActivate: [canActivateAuth],
        children: [
            {
                path: '',
                component: DashboardComponent,
            },
            {
                path: 'booking',
                loadChildren: () => import('./booking/booking.module').then(m => m.BookingModule),
            },
            {
                path: 'admin',
                loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
            },
            {
                path: 'profile',
                loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
            },
            {
                path: 'door',
                component: DoorComponent,
                canActivate: [canActivateDoor],
                resolve: {viewer: resolveViewer},
                data: {
                    seo: {
                        title: 'Accéder au local',
                    } satisfies NaturalSeo,
                },
            },
            {
                path: 'support',
                component: SupportComponent,
                data: {
                    readonly: true,
                    configurationKey: 'support-text',
                    seo: {
                        title: 'Guide',
                    } satisfies NaturalSeo,
                },
            },
        ],
    },
    {
        path: 'announcement',
        component: NaturalDialogTriggerComponent,
        outlet: 'secondary',
        data: {
            seo: {
                title: 'Annonce',
            } satisfies NaturalSeo,
            trigger: {
                component: SupportComponent,
                afterClosedRoute: [{outlets: {secondary: null}}],
                dialogConfig: {
                    width: '600px',
                    maxWidth: '95vw',
                    maxHeight: '97vh',
                    data: {
                        readonly: true,
                        configurationKey: 'announcement-text',
                        showCloseButton: true,
                    },
                },
            } satisfies NaturalDialogTriggerRoutingData<SupportComponent, SupportComponentData>,
        },
    },
    {
        path: '',
        component: HomeComponent,
        children: [
            {
                path: 'error',
                component: ErrorComponent,
            },
            {
                path: '**',
                component: ErrorComponent,
                data: {notFound: true},
            },
        ],
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            paramsInheritanceStrategy: 'always',
        }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
