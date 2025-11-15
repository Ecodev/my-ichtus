import {Component, inject} from '@angular/core';
import {UserService} from '../admin/users/services/user.service';
import {BookingService} from '../admin/bookings/services/booking.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {PermissionsService} from '../shared/services/permissions.service';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {PricedBookings, UserRole} from '../shared/generated-types';
import {NaturalIconDirective} from '@ecodev/natural';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {NavigationsComponent} from '../shared/components/navigations/navigations.component';
import {AsyncPipe} from '@angular/common';
import {MatCard} from '@angular/material/card';
import {UserContactDataComponent} from '../shared/components/user-contact-data/user-contact-data.component';
import {MatDivider} from '@angular/material/divider';

@Component({
    selector: 'app-dashboard',
    imports: [
        AsyncPipe,
        NavigationsComponent,
        MatButton,
        RouterLink,
        MatIcon,
        NaturalIconDirective,
        MatCard,
        UserContactDataComponent,
        MatDivider,
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
    protected readonly userService = inject(UserService);
    protected readonly bookingService = inject(BookingService);
    protected readonly route = inject(ActivatedRoute);
    protected readonly permissionsService = inject(PermissionsService);

    protected title = 'my-ichtus';
    protected readonly adminRoute: Observable<string>;

    protected formations: PricedBookings['bookings']['items'] = [];

    public constructor() {
        this.adminRoute = this.route.data.pipe(
            map(data => {
                switch (data.viewer.role) {
                    case UserRole.trainer:
                        return '/admin/bookable/formation';
                    case UserRole.accounting_verificator:
                        return 'admin/transaction-line';
                    default:
                        return 'admin';
                }
            }),
        );

        this.userService.getRunningServices(this.route.snapshot.data.viewer, true, true).subscribe(formations => {
            this.formations = formations.items;
        });
    }
}
