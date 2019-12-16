import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-booking-history',
    templateUrl: './booking-history.component.html',
    styleUrls: ['./booking-history.component.scss'],
})
export class BookingHistoryComponent implements OnInit {

    constructor(public route: ActivatedRoute) {
    }

    public ngOnInit(): void {
    }

}
