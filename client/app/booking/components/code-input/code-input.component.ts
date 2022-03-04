import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    selector: 'app-code-input',
    templateUrl: './code-input.component.html',
    styleUrls: ['./code-input.component.scss'],
})
export class CodeInputComponent {
    public code = '';

    public constructor(private readonly router: Router) {}

    public goToBookable(code: string): void {
        this.router.navigate(['/booking', code]);
    }
}
