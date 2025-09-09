import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NavigationsComponent} from '../../../shared/components/navigations/navigations.component';

@Component({
    selector: 'app-booking-history',
    imports: [NavigationsComponent],
    templateUrl: './booking-history.component.html',
    styleUrl: './booking-history.component.scss',
})
export class BookingHistoryComponent {
    public readonly route = inject(ActivatedRoute);
}
