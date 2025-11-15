import {Component, inject} from '@angular/core';
import {ErrorService} from './error.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {NaturalIconDirective} from '@ecodev/natural';
import {MatIcon} from '@angular/material/icon';

@Component({
    selector: 'app-error',
    imports: [MatIcon, NaturalIconDirective, MatButton, RouterLink],
    templateUrl: './error.component.html',
    styleUrl: './error.component.scss',
})
export class ErrorComponent {
    protected readonly error: Error | null = null;

    public constructor() {
        const errorService = inject(ErrorService);
        const route = inject(ActivatedRoute);

        this.error = errorService.getLastError();

        if (route.snapshot.data.notFound) {
            this.error = new Error(
                `La page que tu recherches n'existe pas. Elle a peut-être été déplacée ou supprimée.`,
            );
        }
    }
}
