import {Routes} from '@angular/router';
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
        path: 'navigations',
        loadComponent: () =>
            import('./navigations/external-navigations.component').then(m => m.ExternalNavigationsComponent),
        data: {
            seo: {
                title: 'Cahier de sortie',
            } satisfies NaturalSeo,
        },
    },
    {
        path: 'login',
        component: LoginComponent,
        resolve: {viewer: resolveViewer},
    },
    {
        // Registration
        path: 'user',
        component: HomeComponent,
        loadChildren: () => import('./user/user.routes').then(m => m.routes),
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
                loadChildren: () => import('./booking/booking.routes').then(m => m.routes),
            },
            {
                path: 'admin',
                loadChildren: () => import('./admin/admin.routes').then(m => m.routes),
            },
            {
                path: 'profile',
                loadChildren: () => import('./profile/profile.routes').then(m => m.routes),
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
