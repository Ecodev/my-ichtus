import {Component} from '@angular/core';
import {UserService} from '../admin/users/services/user.service';
import {BookingService} from '../admin/bookings/services/booking.service';
import {ActivatedRoute} from '@angular/router';
import {PermissionsService} from '../shared/services/permissions.service';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {UserRole} from '../shared/generated-types';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
    public title = 'my-ichtus';
    public readonly adminRoute: Observable<string>;

    public constructor(
        public readonly userService: UserService,
        public readonly bookingService: BookingService,
        public readonly route: ActivatedRoute,
        public readonly permissionsService: PermissionsService,
    ) {
        this.adminRoute = this.route.data.pipe(
            map(data => {
                switch (data.viewer.model.role) {
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
