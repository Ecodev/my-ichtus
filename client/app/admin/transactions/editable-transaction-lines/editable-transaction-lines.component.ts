import {
    type AvailableColumn,
    formatIsoDateTime,
    NaturalAbstractEditableList,
    NaturalColumnsPickerComponent,
    NaturalErrorMessagePipe,
    NaturalIconDirective,
    NaturalSelectComponent,
    NaturalSelectHierarchicComponent,
    TypedMatCellDef,
} from '@ecodev/natural';
import {Component, inject, Input, ChangeDetectionStrategy} from '@angular/core';
import {TransactionLineService} from '../services/transactionLine.service';
import {BookableService} from '../../bookables/services/bookable.service';
import {type TransactionLineInput, type TransactionLinesQuery} from '../../../shared/generated-types';
import {TransactionTagService} from '../../transactionTags/services/transactionTag.service';
import {accountHierarchicConfiguration} from '../../../shared/hierarchic-selector/AccountHierarchicConfiguration';
import {map, of, Subject, switchMap} from 'rxjs';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {
    MatCell,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
} from '@angular/material/table';
import {
    type AbstractControl,
    FormArray,
    type FormGroup,
    FormsModule,
    ReactiveFormsModule,
    type ValidationErrors,
} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WarningComponent} from '../../../shared/warning.component';
import {CurrencyPipe} from '@angular/common';
import {Big} from 'big.js';

export type TransactionLinesBalance = {
    totalDebit: number;
    totalCredit: number;
};

function toBig(value: unknown): Big | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    try {
        return new Big(value as Big.BigSource);
    } catch {
        return null;
    }
}

/**
 * Mirrors the server-side check for overall balanced credits and debits (multi line)
 */
function transactionLinesBalanceValidator(control: AbstractControl): ValidationErrors | null {
    if (!(control instanceof FormArray)) {
        return null;
    }

    let totalDebit = new Big(0);
    let totalCredit = new Big(0);

    for (const row of control.controls) {
        const balance = toBig(row.get('balance')?.value);
        if (!balance) {
            continue;
        }

        if (row.get('debit')?.value) {
            totalDebit = totalDebit.plus(balance);
        }
        if (row.get('credit')?.value) {
            totalCredit = totalCredit.plus(balance);
        }
    }

    if (totalDebit.eq(totalCredit)) {
        return null;
    }

    const unbalanced: TransactionLinesBalance = {
        totalDebit: totalDebit.toNumber(),
        totalCredit: totalCredit.toNumber(),
    };

    return {unbalanced};
}

/**
 * Gather the account errors of every line, to show them once under the table instead of reserving
 * room on every row for a message that hardly ever appears. Angular validates children first, so
 * there is nothing to check again here, only to collect and to name.
 */
function accountErrorsValidator(control: AbstractControl): ValidationErrors | null {
    if (!(control instanceof FormArray)) {
        return null;
    }

    const linesByMessage = new Map<string, string[]>();
    control.controls.forEach((row, index) => {
        const message = row.get('debit')?.errors?.atLeastOneAccount ?? row.get('credit')?.errors?.atLeastOneAccount;
        if (!message) {
            return;
        }

        // A line the user just added has no label yet, and that is precisely the one likely to be wrong
        const label = row.get('name')?.value || `Ligne ${index + 1}`;
        linesByMessage.set(message, [...(linesByMessage.get(message) ?? []), label]);
    });

    if (!linesByMessage.size) {
        return null;
    }

    const messages = [...linesByMessage].map(([message, labels]) => `${labels.join(', ')}: ${message}`);

    return {accounts: messages};
}

/**
 * Mirrors the server-side check that a transaction always has at least one line
 */
function atLeastOneLineValidator(control: AbstractControl): ValidationErrors | null {
    if (!(control instanceof FormArray)) {
        return null;
    }

    return control.length ? null : {noLine: true};
}

export type EditableTransactionLinesInput =
    | {mode: 'fetch'; id: string}
    | {mode: 'items'; items: (TransactionLinesQuery['transactionLines']['items'][0] | TransactionLineInput)[]}
    | {
          mode: 'empty';
      };

@Component({
    selector: 'app-editable-transaction-lines',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatTable,
        MatHeaderCellDef,
        MatHeaderRowDef,
        MatColumnDef,
        TypedMatCellDef,
        MatRowDef,
        MatHeaderCell,
        MatCell,
        MatHeaderRow,
        MatRow,
        MatFormField,
        MatLabel,
        MatError,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        MatSuffix,
        NaturalErrorMessagePipe,
        MatInput,
        NaturalSelectHierarchicComponent,
        MatCheckbox,
        NaturalSelectComponent,
        CdkTextareaAutosize,
        MatIconButton,
        MatIcon,
        NaturalIconDirective,
        NaturalColumnsPickerComponent,
        WarningComponent,
        CurrencyPipe,
    ],
    templateUrl: './editable-transaction-lines.component.html',
    styleUrl: './editable-transaction-lines.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class EditableTransactionLinesComponent extends NaturalAbstractEditableList<
    TransactionLineService,
    TransactionLinesQuery['transactionLines']['items'][0] | TransactionLineInput
> {
    protected readonly transactionTagService = inject(TransactionTagService);
    protected readonly bookableService = inject(BookableService);

    @Input({required: true})
    public set input(value: EditableTransactionLinesInput) {
        this.input$.next(value);
    }

    private readonly input$ = new Subject<EditableTransactionLinesInput>();

    protected accountHierarchicConfig = accountHierarchicConfiguration();
    protected columnsForTable: string[] = [];

    protected readonly availableColumns: AvailableColumn[] = [
        {id: 'date', label: "Date d'écriture"},
        {id: 'name', label: 'Libellé'},
        {id: 'balance', label: 'Montant'},
        {id: 'isReconciled', label: 'Pointé'},
        {id: 'debit', label: 'Compte débit'},
        {id: 'credit', label: 'Compte crédit'},
        {id: 'bookable', label: 'Réservable'},
        {id: 'transactionTag', label: 'Tag'},
        {id: 'remarks', label: 'Remarques'},
        {id: 'remove', label: 'Supprimer'},
    ];

    /**
     * Replace the transactionDate of each line by a new one. Writing in the controls rather than
     * handing back a whole new list keeps whatever the user was filling in.
     */
    public setLinesDate(newDate: Date): void {
        const date = formatIsoDateTime(newDate);
        for (const line of this.formArray.controls) {
            line.get('transactionDate')?.setValue(date);
        }
    }

    /**
     * Add a line, dated like the transaction it joins.
     */
    public addLineOn(transactionDate: string): void {
        this.addEmpty();
        this.formArray.controls.at(-1)?.get('transactionDate')?.setValue(transactionDate);
    }

    /**
     * Non-null when total debits and total credits of the transaction don't match,
     * see transactionLinesBalanceValidator()
     */
    protected get unbalanced(): TransactionLinesBalance | null {
        return (this.formArray.errors?.unbalanced as TransactionLinesBalance | undefined) ?? null;
    }

    /**
     * True when the transaction has no line at all, see atLeastOneLineValidator()
     */
    protected get hasNoLine(): boolean {
        return !!this.formArray.errors?.noLine;
    }

    /**
     * The account errors of every line, named and grouped, see accountErrorsValidator()
     */
    protected get accountErrors(): string[] {
        return (this.formArray.errors?.accounts as string[] | undefined) ?? [];
    }

    public constructor() {
        super(inject(TransactionLineService));

        this.formArray.addValidators([
            transactionLinesBalanceValidator,
            atLeastOneLineValidator,
            accountErrorsValidator,
        ]);
        this.formArray.updateValueAndValidity();

        this.input$
            .pipe(
                takeUntilDestroyed(),
                switchMap(input => {
                    switch (input.mode) {
                        case 'fetch':
                            this.variablesManager.set('variables', {
                                filter: {groups: [{conditions: [{transaction: {equal: {value: input.id}}}]}]},
                            });

                            return this.service.getAll(this.variablesManager).pipe(map(results => results.items));

                        case 'items':
                            return of(input.items);

                        case 'empty':
                            return of([{} as TransactionLineInput]);
                    }
                }),
                map(items => this.setItems(items)),
            )
            .subscribe();
    }

    public override validateForm(): void {
        super.validateForm();

        // Update validity of all debit account
        //
        // I honestly don't understand why this is needed, because `super.validateForm()`,
        // calling `markAsDirty()` on all controls, should be enough. But it seems that
        // because the field is a NaturalSelectHierarchic, then the dirty flag somehow
        // does not trigger the validator at all. So short of being able to fix this properly,
        // I specifically call the validator on one of the two fields, which is enough (!)
        (this.form.controls.rows as FormArray<FormGroup>).controls.forEach(c => {
            c.controls.debit.updateValueAndValidity();
        });
    }
}
