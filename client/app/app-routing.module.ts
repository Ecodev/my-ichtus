import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { DoorComponent } from './door/door.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ErrorComponent } from './shared/components/error/error.component';
import { SafetyComponent } from './safety/safety.component';
import { BookingService } from './admin/bookings/services/booking.service';
import { ViewerResolver } from './admin/users/services/viewer.resolver';
import { AuthGuard } from './shared/guards/auth.guard';
import { DoorGuard } from './shared/guards/door.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        resolve: {viewer: ViewerResolver},
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
            title: 'Sorties en cours',
            contextVariables: BookingService.runningSelfApprovedQV,
            contextColumns: ['bookable', 'destination', 'startDate', 'estimatedEndDate', 'participantCount'],
        },
    },
    // Auth required routes
    {
        path: '',
        component: HomeComponent,
        resolve: {viewer: ViewerResolver},
        canActivate: [AuthGuard],
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
                canActivate: [DoorGuard],
                resolve: {viewer: ViewerResolver},
            },
        ],
    },
    {
        path: 'error',
        component: HomeComponent,
        children: [
            {
                path: '',
                component: ErrorComponent,
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
export class AppRoutingModule {
}
