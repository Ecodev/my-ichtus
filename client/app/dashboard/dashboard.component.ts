import {Component, OnInit} from '@angular/core';
import {UserService} from '../admin/users/services/user.service';
import {BookingService} from '../admin/bookings/services/booking.service';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    public title = 'my-ichtus';

    public UserService = UserService;

    constructor(public userService: UserService, public bookingService: BookingService, public route: ActivatedRoute) {}

    public ngOnInit(): void {}
}
