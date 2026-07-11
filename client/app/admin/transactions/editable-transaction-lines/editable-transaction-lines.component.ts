import {
    NaturalAbstractEditableList,
    NaturalErrorMessagePipe,
    NaturalIconDirective,
    NaturalSelectComponent,
    NaturalSelectHierarchicComponent,
    TypedMatCellDef,
} from '@ecodev/natural';
import {Component, inject, Input} from '@angular/core';
import {TransactionLineService} from '../services/transactionLine.service';
import {BookableService} from '../../bookables/services/bookable.service';
import {TransactionLineInput, TransactionLinesQuery} from '../../../shared/generated-types';
import {TransactionTagService} from '../../transactionTags/services/transactionTag.service';
import {accountHierarchicConfiguration} from '../../../shared/hierarchic-selector/AccountHierarchicConfiguration';
import {map, of, Subject, switchMap} from 'rxjs';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
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
import {AbstractControl, FormArray, FormsModule, ReactiveFormsModule, ValidationErrors} from '@angular/forms';
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
        NaturalErrorMessagePipe,
        MatInput,
        NaturalSelectHierarchicComponent,
        MatCheckbox,
        NaturalSelectComponent,
        CdkTextareaAutosize,
        MatIconButton,
        MatIcon,
        NaturalIconDirective,
        WarningComponent,
        CurrencyPipe,
    ],
    templateUrl: './editable-transaction-lines.component.html',
    styleUrl: './editable-transaction-lines.component.scss',
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
    protected columns = [
        'name',
        'balance',
        'debit',
        'credit',
        'bookable',
        'transactionTag',
        'remarks',
        'isReconciled',
        'remove',
    ];

    /**
     * Non-null when total debits and total credits of the transaction don't match,
     * see transactionLinesBalanceValidator()
     */
    protected get unbalanced(): TransactionLinesBalance | null {
        return (this.formArray.errors?.unbalanced as TransactionLinesBalance | undefined) ?? null;
    }

    public constructor() {
        super(inject(TransactionLineService));

        this.formArray.addValidators(transactionLinesBalanceValidator);
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
}
