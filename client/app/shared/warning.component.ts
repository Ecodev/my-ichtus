import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

@Component({
    selector: 'app-warning',
    imports: [MatIcon],
    template: ` <mat-icon [fontIcon]="type()" [color]="color()" />
        <p>
            <ng-content />
        </p>`,
    styles: `
        :host {
            display: grid;
            grid: auto / auto 1fr;
            grid-gap: 0.5em;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarningComponent {
    public readonly type = input<'warning' | 'check'>('warning');
    protected readonly color = computed(() => (this.type() === 'warning' ? 'warn' : null));
}
