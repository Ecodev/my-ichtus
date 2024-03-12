import {Component} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {FocusDirective} from '../../../shared/directives/focus';
import {FormsModule} from '@angular/forms';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-code-input',
    templateUrl: './code-input.component.html',
    styleUrl: './code-input.component.scss',
    standalone: true,
    imports: [FlexModule, FormsModule, FocusDirective, MatButtonModule, RouterLink],
})
export class CodeInputComponent {
    public code = '';

    public constructor(private readonly router: Router) {}

    public goToBookable(code: string): void {
        this.router.navigate(['/booking', code]);
    }
}
