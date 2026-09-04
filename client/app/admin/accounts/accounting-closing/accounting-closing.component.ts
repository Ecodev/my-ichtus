import {NaturalErrorMessagePipe} from '@ecodev/natural';
import {Component, ChangeDetectionStrategy, effect, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatDialogModule} from '@angular/material/dialog';
import {DateAdapter} from '@angular/material/core';
import {resolveLastClosingDate} from '../../transactions/services/transaction.resolver';

@Component({
    selector: 'app-accounting-closing',
    imports: [
        MatDialogModule,
        MatFormField,
        MatLabel,
        MatError,
        NaturalErrorMessagePipe,
        MatSuffix,
        MatInput,
        FormsModule,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        ReactiveFormsModule,
        MatButton,
    ],
    templateUrl: './accounting-closing.component.html',
    styleUrl: './accounting-closing.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class AccountingClosingComponent {
    private readonly dateAdapter = inject<DateAdapter<Date>>(DateAdapter);
    protected readonly form = new FormControl<Date | null>(null, [Validators.required]);
    protected readonly today = new Date();

    protected readonly lastClosingDate = toSignal(resolveLastClosingDate(), {initialValue: null});

    public constructor() {
        const lastYear = new Date().getFullYear() - 1;
        const date = new Date(lastYear, 11, 31);
        this.form.setValue(date);

        effect(() => {
            const minimum = this.dateAdapter.deserialize(this.lastClosingDate());
            const value = this.form.value;
            if (minimum && value && this.dateAdapter.compareDate(value, minimum) < 0) {
                const isClosable = this.dateAdapter.compareDate(minimum, this.today) <= 0;
                this.form.setValue(isClosable ? minimum : null);
            }
        });
    }
}
