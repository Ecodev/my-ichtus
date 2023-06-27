import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NavigationsComponent} from '../../../shared/components/navigations/navigations.component';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-booking-history',
    templateUrl: './booking-history.component.html',
    styleUrls: ['./booking-history.component.scss'],
    standalone: true,
    imports: [NgIf, NavigationsComponent],
})
export class BookingHistoryComponent {
    public constructor(public readonly route: ActivatedRoute) {}
}
