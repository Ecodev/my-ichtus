import {Component, inject} from '@angular/core';
import {UserService} from '../admin/users/services/user.service';
import {BookingService} from '../admin/bookings/services/booking.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {PermissionsService} from '../shared/services/permissions.service';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {UserRole} from '../shared/generated-types';
import {NaturalIconDirective} from '@ecodev/natural';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {NavigationsComponent} from '../shared/components/navigations/navigations.component';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    imports: [CommonModule, NavigationsComponent, MatButtonModule, RouterLink, MatIconModule, NaturalIconDirective],
})
export class DashboardComponent {
    public readonly userService = inject(UserService);
    public readonly bookingService = inject(BookingService);
    public readonly route = inject(ActivatedRoute);
    public readonly permissionsService = inject(PermissionsService);

    public title = 'my-ichtus';
    public readonly adminRoute: Observable<string>;

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
    }
}
