import {NaturalErrorMessagePipe} from '@ecodev/natural';
import {Component, inject, Input} from '@angular/core';
import {TransactionLineService} from '../services/transactionLine.service';
import {BookableService} from '../../bookables/services/bookable.service';
import {TransactionLineInput, TransactionLinesQuery} from '../../../shared/generated-types';
import {TransactionTagService} from '../../transactionTags/services/transactionTag.service';
import {
    NaturalAbstractEditableList,
    NaturalIconDirective,
    NaturalSelectComponent,
    NaturalSelectHierarchicComponent,
} from '@ecodev/natural';
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
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
} from '@angular/material/table';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

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
        MatCellDef,
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

    protected accountHierarchicConfig = accountHierarchicConfiguration;
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

    public constructor() {
        super(inject(TransactionLineService));

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
