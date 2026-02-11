import {Component, input} from '@angular/core';
import {AvailabilityStatus} from '../../../admin/bookables/bookable';

@Component({
    selector: 'app-flag',
    templateUrl: './flag.component.html',
    styleUrl: './flag.component.scss',
    host: {
        '[class]': 'status()',
    },
})
export class FlagComponent {
    public readonly status = input<'' | AvailabilityStatus | 'pending-application'>('');
}
