import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {FocusDirective} from '../../../shared/directives/focus';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-code-input',
    templateUrl: './code-input.component.html',
    styleUrl: './code-input.component.scss',
    imports: [FormsModule, FocusDirective, MatButtonModule, RouterLink],
})
export class CodeInputComponent {
    private readonly router = inject(Router);

    public code = '';

    public goToBookable(code: string): void {
        this.router.navigate(['/booking', code]);
    }
}
