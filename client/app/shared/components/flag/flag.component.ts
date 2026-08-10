import {Component, input, ChangeDetectionStrategy} from '@angular/core';
import {type AvailabilityStatus} from '../../../admin/bookables/bookable';

@Component({
    selector: 'app-flag',
    templateUrl: './flag.component.html',
    styleUrl: './flag.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    host: {
        '[class]': 'status()',
    },
})
export class FlagComponent {
    public readonly status = input<'' | AvailabilityStatus | 'pending-application'>('');
}
