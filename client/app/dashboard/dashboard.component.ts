import {Component, OnInit} from '@angular/core';
import {UserService} from '../admin/users/services/user.service';
import {BookingService} from '../admin/bookings/services/booking.service';
import {ActivatedRoute} from '@angular/router';
import {PermissionsService} from '../shared/services/permissions.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    public title = 'my-ichtus';

    constructor(
        public readonly userService: UserService,
        public readonly bookingService: BookingService,
        public readonly route: ActivatedRoute,
        public readonly permissionsService: PermissionsService,
    ) {}

    public ngOnInit(): void {}
}
