import {Component, Input} from '@angular/core';
import {TransactionLineService} from '../services/transactionLine.service';
import {BookableService} from '../../bookables/services/bookable.service';
import {TransactionLineInput, TransactionLines} from '../../../shared/generated-types';
import {TransactionTagService} from '../../transactionTags/services/transactionTag.service';
import {
    NaturalAbstractEditableList,
    NaturalIconDirective,
    NaturalSelectComponent,
    NaturalSelectHierarchicComponent,
} from '@ecodev/natural';
import {accountHierarchicConfiguration} from '../../../shared/hierarchic-selector/AccountHierarchicConfiguration';
import {map, of, Subject, switchMap} from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {TextFieldModule} from '@angular/cdk/text-field';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTableModule} from '@angular/material/table';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export type EditableTransactionLinesInput =
    | {mode: 'fetch'; id: string}
    | {mode: 'items'; items: (TransactionLines['transactionLines']['items'][0] | TransactionLineInput)[]}
    | {
          mode: 'empty';
      };

@Component({
    selector: 'app-editable-transaction-lines',
    templateUrl: './editable-transaction-lines.component.html',
    styleUrl: './editable-transaction-lines.component.scss',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        NaturalSelectHierarchicComponent,
        MatCheckboxModule,
        NaturalSelectComponent,
        TextFieldModule,
        MatButtonModule,
        MatIconModule,
        NaturalIconDirective,
    ],
})
export class EditableTransactionLinesComponent extends NaturalAbstractEditableList<
    TransactionLineService,
    TransactionLines['transactionLines']['items'][0] | TransactionLineInput
> {
    @Input({required: true})
    public set input(value: EditableTransactionLinesInput) {
        this.input$.next(value);
    }

    private readonly input$ = new Subject<EditableTransactionLinesInput>();

    public accountHierarchicConfig = accountHierarchicConfiguration;
    public columns = [
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

    public constructor(
        transactionLineService: TransactionLineService,
        public readonly transactionTagService: TransactionTagService,
        public readonly bookableService: BookableService,
    ) {
        super(transactionLineService);

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
