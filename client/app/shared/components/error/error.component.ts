import {Component} from '@angular/core';
import {ErrorService} from './error.service';

@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss'],
})
export class ErrorComponent {
    public readonly error: Error | null;

    constructor(errorService: ErrorService) {
        this.error = errorService.getLastError();
    }
}
