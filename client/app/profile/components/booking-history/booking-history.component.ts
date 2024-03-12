import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NavigationsComponent} from '../../../shared/components/navigations/navigations.component';

@Component({
    selector: 'app-booking-history',
    templateUrl: './booking-history.component.html',
    styleUrl: './booking-history.component.scss',
    standalone: true,
    imports: [NavigationsComponent],
})
export class BookingHistoryComponent {
    public constructor(public readonly route: ActivatedRoute) {}
}
