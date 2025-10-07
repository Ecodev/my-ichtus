import {Component, input} from '@angular/core';
import {UserContactData} from '../../generated-types';
import {NonBreakingSpacePipe} from '../../pipes/non-breaking-space.pipe';

@Component({
    selector: 'app-user-contact-data',
    imports: [NonBreakingSpacePipe],
    templateUrl: './user-contact-data.component.html',
    styleUrl: './user-contact-data.component.scss',
})
export class UserContactDataComponent {
    public readonly user = input.required<UserContactData | null>();
    public readonly title = input('Personne de contact');
    public readonly emailSubject = input('');
}
