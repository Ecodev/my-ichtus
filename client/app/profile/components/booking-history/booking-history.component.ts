import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NavigationsComponent} from '../../../shared/components/navigations/navigations.component';

@Component({
    selector: 'app-booking-history',
    imports: [NavigationsComponent],
    templateUrl: './booking-history.component.html',
    styleUrl: './booking-history.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class BookingHistoryComponent {
    protected readonly route = inject(ActivatedRoute);
}
