import {Component, input} from '@angular/core';
import {UserContactData} from '../../generated-types';

@Component({
    selector: 'app-user-contact-data',
    imports: [],
    templateUrl: './user-contact-data.component.html',
    styleUrl: './user-contact-data.component.scss',
})
export class UserContactDataComponent {
    public readonly user = input.required<UserContactData>();
    public readonly emailSubject = input('');
}
