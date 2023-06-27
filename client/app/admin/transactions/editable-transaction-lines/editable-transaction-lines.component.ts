import {Component, Input, OnInit} from '@angular/core';
import {TransactionLineService} from '../services/transactionLine.service';
import {BookableService} from '../../bookables/services/bookable.service';
import {Transaction, TransactionLineInput, TransactionLines} from '../../../shared/generated-types';
import {TransactionTagService} from '../../transactionTags/services/transactionTag.service';
import {
    NaturalAbstractEditableList,
    NaturalSelectHierarchicComponent,
    NaturalSelectComponent,
    NaturalIconDirective,
} from '@ecodev/natural';
import {accountHierarchicConfiguration} from '../../../shared/hierarchic-selector/AccountHierarchicConfiguration';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {TextFieldModule} from '@angular/cdk/text-field';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTableModule} from '@angular/material/table';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {NgIf, CurrencyPipe} from '@angular/common';

@Component({
    selector: 'app-editable-transaction-lines',
    templateUrl: './editable-transaction-lines.component.html',
    styleUrls: ['./editable-transaction-lines.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        FlexModule,
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
        CurrencyPipe,
    ],
})
export class EditableTransactionLinesComponent
    extends NaturalAbstractEditableList<
        TransactionLineService,
        TransactionLines['transactionLines']['items'][0] | TransactionLineInput
    >
    implements OnInit
{
    @Input({required: true}) public transaction!: Transaction['transaction'];

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
        private readonly transactionLineService: TransactionLineService,
        public readonly transactionTagService: TransactionTagService,
        public readonly bookableService: BookableService,
    ) {
        super(transactionLineService);
    }

    public ngOnInit(): void {
        if (this.transaction && this.transaction.id) {
            this.variablesManager.set('variables', {
                filter: {groups: [{conditions: [{transaction: {equal: {value: this.transaction.id}}}]}]},
            });

            // TODO : Replace getAll by watchAll
            this.service.getAll(this.variablesManager).subscribe(results => {
                this.setItems(results.items);
            });
        } else {
            this.addEmpty();
        }
    }
}
