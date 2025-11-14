import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {FocusDirective} from '../../../shared/directives/focus';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-code-input',
    imports: [FormsModule, FocusDirective, MatButton, RouterLink],
    templateUrl: './code-input.component.html',
    styleUrl: './code-input.component.scss',
})
export class CodeInputComponent {
    private readonly router = inject(Router);

    public code = '';

    protected goToBookable(code: string): void {
        this.router.navigate(['/booking', code]);
    }
}
