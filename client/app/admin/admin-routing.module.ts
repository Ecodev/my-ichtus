import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { BookablesComponent } from './bookables/bookables/bookables.component';
import { BookableComponent } from './bookables/bookable/bookable.component';
import { LicenseResolver } from './licenses/services/license.resolver';
import { BookableResolver } from './bookables/services/bookable.resolver';
import { LicensesComponent } from './licenses/licenses/licenses.component';
import { LicenseComponent } from './licenses/license/license.component';
import { UserTagsComponent } from './userTags/userTags/userTags.component';
import { UserTagComponent } from './userTags/userTag/userTag.component';
import { UserTagResolver } from './userTags/services/userTag.resolver';
import { BookingsComponent } from './bookings/bookings/bookings.component';
import { UsersComponent } from './users/users/users.component';
import { UserComponent } from './users/user/user.component';
import { UserResolver } from './users/services/user.resolver';
import { BookingComponent } from './bookings/booking/booking.component';
import { BookingResolver } from './bookings/services/booking.resolver';
import { BookingService } from './bookings/services/booking.service';
import { UserService } from './users/services/user.service';
import { BookableService } from './bookables/services/bookable.service';

const routes: Routes = [
        {
            path: '',
            component: AdminComponent,
            children: [
                {
                    path: '',
                    component: BookingsComponent,
                    data: {
                        title: 'Sorties en cours',
                        queryVariables: BookingService.runningSelfApprovedQV,
                    },
                },
                {
                    path: 'booking',
                    children: [
                        {
                            path: '',
                            component: BookingsComponent,
                            data: {title: 'Réservations'},
                        },
                        {
                            path: 'self-approved',
                            component: BookingsComponent,
                            data: {
                                title: 'Toutes les sorties',
                                queryVariables: BookingService.selfApprovedQV,
                            },
                        },
                        {
                            path: 'storage-application',
                            component: BookingsComponent,
                            data: {
                                title: 'Demandes de stockage en attente',
                                queryVariables: BookingService.storageApplication,
                            },
                        },
                        {
                            path: 'other-application',
                            component: BookingsComponent,
                            data: {
                                title: 'Demande de services en attente',
                                queryVariables: BookingService.notStorageApplication,
                            },
                        },
                        {
                            path: 'new',
                            component: BookingComponent,
                            resolve: {
                                booking: BookingResolver,
                            },
                        },
                        {
                            path: ':bookingId', // last
                            component: BookingComponent,
                            resolve: {
                                booking: BookingResolver,
                            },
                        },
                    ],
                },
                {
                    path: 'bookable',
                    children: [
                        {
                            path: '',
                            component: BookablesComponent,
                            data: {title: 'Réservables'},
                        },
                        {
                            path: 'services',
                            component: BookablesComponent,
                            data: {
                                title: 'Cotisations',
                                queryVariables: BookableService.membershipServices,
                            },
                        },
                        {
                            path: 'sup',
                            component: BookablesComponent,
                            data: {
                                title: 'Stand up paddle',
                                queryVariables: BookableService.byTag(6000),
                            },
                        },
                        {
                            path: 'planche',
                            component: BookablesComponent,
                            data: {
                                title: 'Planches',
                                queryVariables: BookableService.byTag(6001),
                            },
                        },
                        {
                            path: 'canoe',
                            component: BookablesComponent,
                            data: {
                                title: 'Canoës',
                                queryVariables: BookableService.byTag(6002),
                            },
                        },
                        {
                            path: 'kayak',
                            component: BookablesComponent,
                            data: {
                                title: 'Kayaks',
                                queryVariables: BookableService.byTag(6003),
                            },
                        },
                        {
                            path: 'aviron',
                            component: BookablesComponent,
                            data: {
                                title: 'Aviron',
                                queryVariables: BookableService.byTag(6004),
                            },
                        },
                        {
                            path: 'voile-legere',
                            component: BookablesComponent,
                            data: {
                                title: 'Voile légère',
                                queryVariables: BookableService.byTag(6005),
                            },
                        },
                        {
                            path: 'voile-lestee',
                            component: BookablesComponent,
                            data: {
                                title: 'Voile lestée',
                                queryVariables: BookableService.byTag(6006),
                            },
                        },
                        {
                            path: 'armoire',
                            component: BookablesComponent,
                            data: {
                                title: 'Armoires',
                                queryVariables: BookableService.adminByTag(6009),
                            },
                        },
                        {
                            path: 'casier',
                            component: BookablesComponent,
                            data: {
                                title: 'Casiers',
                                queryVariables: BookableService.adminByTag(6010),
                            },
                        },
                        {
                            path: 'flotteur',
                            component: BookablesComponent,
                            data: {
                                title: 'Flotteurs',
                                queryVariables: BookableService.adminByTag(6011),
                            },
                        },
                        {
                            path: 'new',
                            component: BookableComponent,
                            resolve: {
                                bookable: BookableResolver,
                            },
                        },
                        {
                            path: ':bookableId', // last
                            component: BookableComponent,
                            resolve: {
                                bookable: BookableResolver,
                            },
                        },
                    ],
                },
                {
                    path: 'user',
                    children: [
                        {
                            path: '',
                            component: UsersComponent,
                        },
                        {
                            path: 'new',
                            component: UserComponent,
                            resolve: {
                                user: UserResolver,
                            },
                        },
                        {
                            path: ':userId', // last
                            component: UserComponent,
                            resolve: {
                                user: UserResolver,
                            },
                        },
                    ],
                },
                {
                    path: 'member',
                    component: UsersComponent,
                    data: {
                        title: 'Membres',
                        queryVariables: UserService.membersQV,
                    },
                },

                {
                    path: 'license',
                    data: {
                        title: 'Certifications',
                    },
                    children: [
                        {
                            path: '',
                            component: LicensesComponent,

                        },
                        {
                            path: 'new',
                            component: LicenseComponent,
                            resolve: {
                                license: LicenseResolver,
                            },
                        },
                        {
                            path: ':licenseId', // last
                            component: LicenseComponent,
                            resolve: {
                                license: LicenseResolver,
                            },
                        },
                    ],
                },

                {
                    path: 'user-tag',
                    data: {
                        title: 'Tags d\'utilisateurs',
                    },
                    children: [
                        {
                            path: '',
                            component: UserTagsComponent,

                        },
                        {
                            path: 'new',
                            component: UserTagComponent,
                            resolve: {
                                userTag: UserTagResolver,
                            },
                        },
                        {
                            path: ':userTagId', // last
                            component: UserTagComponent,
                            resolve: {
                                userTag: UserTagResolver,
                            },
                        },
                    ],
                },

            ],
        },
    ]
;

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule {
}
