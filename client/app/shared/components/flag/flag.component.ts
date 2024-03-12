import {Component, HostBinding, Input} from '@angular/core';
import {AvailabilityStatus} from '../../../admin/bookables/bookable';

@Component({
    selector: 'app-flag',
    templateUrl: './flag.component.html',
    styleUrl: './flag.component.scss',
    standalone: true,
})
export class FlagComponent {
    @Input()
    @HostBinding('class')
    public status: '' | AvailabilityStatus | 'pending-application' = '';
}
