import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'app-booking-history',
    templateUrl: './booking-history.component.html',
    styleUrls: ['./booking-history.component.scss'],
})
export class BookingHistoryComponent {
    public constructor(public readonly route: ActivatedRoute) {}
}
