import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, RouterLink} from '@angular/router';
import {
    cancellableTimeout,
    NaturalAbstractDetail,
    NaturalDetailHeaderComponent,
    NaturalFixedButtonComponent,
    NaturalIconDirective,
    NaturalLinkableTabDirective,
    NaturalSeoResolveData,
    NaturalStampComponent,
} from '@ecodev/natural';
import {TransactionService} from '../services/transaction.service';
import {EMPTY, Observable} from 'rxjs';
import {filter, first} from 'rxjs/operators';
import {
    CreateTransaction,
    CurrentUserForProfile,
    ExpenseClaim,
    ExpenseClaimType,
    TransactionLineInput,
    UpdateTransaction,
} from '../../../shared/generated-types';
import {BookableService} from '../../bookables/services/bookable.service';
import {
    EditableTransactionLinesComponent,
    EditableTransactionLinesInput,
} from '../editable-transaction-lines/editable-transaction-lines.component';
import {TransactionLineService} from '../services/transactionLine.service';
import {AccountingDocumentsComponent} from '../../accounting-documents/accounting-documents.component';
import {UserService} from '../../users/services/user.service';
import {MatIconModule} from '@angular/material/icon';
import {
    EcoFabSpeedDialActionsComponent,
    EcoFabSpeedDialComponent,
    EcoFabSpeedDialTriggerComponent,
} from '@ecodev/fab-speed-dial';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TransactionLinesComponent} from '../transactionLines/transactionLines.component';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {TextFieldModule} from '@angular/cdk/text-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTabsModule} from '@angular/material/tabs';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DuplicatedTransactionResolve} from '../transaction';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrl: './transaction.component.scss',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NaturalDetailHeaderComponent,
        CommonModule,
        MoneyComponent,
        MatTabsModule,
        NaturalLinkableTabDirective,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        TextFieldModule,
        MatDividerModule,
        MatButtonModule,
        RouterLink,
        AccountingDocumentsComponent,
        TransactionLinesComponent,
        EditableTransactionLinesComponent,
        NaturalStampComponent,
        NaturalFixedButtonComponent,
        MatTooltipModule,
        EcoFabSpeedDialComponent,
        EcoFabSpeedDialTriggerComponent,
        MatIconModule,
        NaturalIconDirective,
        EcoFabSpeedDialActionsComponent,
    ],
})
export class TransactionComponent
    extends NaturalAbstractDetail<
        TransactionService,
        NaturalSeoResolveData & {
            duplicatedTransaction?: DuplicatedTransactionResolve | null;
            expenseClaim?: ExpenseClaim['expenseClaim'] | null;
        }
    >
    implements OnInit
{
    public readonly bookableService = inject(BookableService);
    public readonly transactionLineService = inject(TransactionLineService);
    public readonly userService = inject(UserService);

    @ViewChild(EditableTransactionLinesComponent) public transactionLinesComponent!: EditableTransactionLinesComponent;
    @ViewChild('transactionDocuments', {static: true}) private accountingDocuments!: AccountingDocumentsComponent;

    /**
     * Edition mode, allows to edit lines
     */
    public updateTransactionLines = false;

    public ExpenseClaimType = ExpenseClaimType;

    public viewer!: NonNullable<CurrentUserForProfile['viewer']>;
    public transactionLines: EditableTransactionLinesInput = {mode: 'empty'};

    public constructor() {
        super('transaction', inject(TransactionService));
    }

    public override ngOnInit(): void {
        super.ngOnInit();

        if (this.isUpdatePage()) {
            this.transactionLines = {mode: 'fetch', id: this.data.model.id};
        }

        this.viewer = this.route.snapshot.data.viewer;

        // Activate edition mode on creation
        if (!this.data.model.id) {
            this.updateTransactionLines = true;
        }

        const expenseClaim = this.data.expenseClaim;
        const duplicatedTransaction = this.data.duplicatedTransaction;
        if (expenseClaim || duplicatedTransaction) {
            cancellableTimeout(this.destroyRef).subscribe(() => {
                // Prevent human to input something that would be overridden when prefill finishes
                this.transactionLinesComponent.form.disable();

                if (expenseClaim) {
                    this.prefillFromExpenseClaim(expenseClaim);
                } else if (duplicatedTransaction) {
                    this.prefillFromTransaction(duplicatedTransaction);
                }
            });
        }
    }

    private prefillFromExpenseClaim(expenseClaim: ExpenseClaim['expenseClaim']): void {
        this.data.model.expenseClaim = expenseClaim;
        this.updateTransactionLines = true;

        // Set default name
        let transactionName = '';
        switch (expenseClaim.type) {
            case ExpenseClaimType.ExpenseClaim:
                transactionName = 'Traitement de la dépense "' + expenseClaim.name + '"';
                break;
            case ExpenseClaimType.Refund:
                transactionName = 'Remboursement de "' + expenseClaim.name + '"';
                break;
            case ExpenseClaimType.Invoice:
                transactionName = 'Paiement facture "' + expenseClaim.name + '"';
                break;
        }
        const nameControl = this.form.get('name');
        if (nameControl) {
            nameControl.setValue(transactionName);
        }

        const expenseClaimControl = this.form.get('expenseClaim');
        if (expenseClaimControl) {
            expenseClaimControl.setValue(expenseClaim);
        }

        let preset: Observable<TransactionLineInput[]> | null = null;
        if (expenseClaim.owner?.account) {
            if (expenseClaim.type === ExpenseClaimType.ExpenseClaim) {
                preset = this.service.getExpenseClaimPreset(expenseClaim.owner.account, expenseClaim.amount);
            } else if (expenseClaim.type === ExpenseClaimType.Refund) {
                preset = this.service.getRefundPreset(expenseClaim.owner.account, expenseClaim.amount);
            }
        }

        if (expenseClaim.type === ExpenseClaimType.Invoice) {
            preset = this.service.getInvoicePreset(transactionName, expenseClaim.amount);
        }

        if (preset) {
            preset.subscribe(preset => this.transactionLinesComponent.setItems(preset));
        }
    }

    private prefillFromTransaction(duplicatedTransaction: DuplicatedTransactionResolve): void {
        this.data.model = {...this.data.model, ...duplicatedTransaction.transaction};
        this.form.patchValue(duplicatedTransaction.transaction);
        this.form.controls.transactionDate.markAsDirty();

        this.transactionLines = {mode: 'items', items: duplicatedTransaction.transactionLines};
    }

    public save(): void {
        if (!this.userService.canUpdateTransaction(this.viewer)) {
            return;
        }

        if (this.transactionLinesComponent) {
            const rawTransactionLines = this.transactionLinesComponent.getItems();
            this.form.controls.transactionLines.setValue(
                rawTransactionLines.map(line => this.transactionLineService.getInput(line, true)),
            );

            this.transactionLinesComponent.validateForm();

            if (!this.transactionLinesComponent.form.valid) {
                return;
            }
        } else {
            this.form.controls.transactionLines.setValue(null);
        }

        if (this.isUpdatePage()) {
            this.update(true);
        } else {
            this.create();
        }
    }

    public override delete(): void {
        super.delete(['/admin/transaction-line']);
    }

    protected override postUpdate(object: UpdateTransaction['updateTransaction']): void {
        this.updateTransactionLines = false;
        this.accountingDocuments.save(object);
    }

    /**
     * Wait the creation redirection, to have an url like /transaction/123, then redirect to /transaction/new
     * If we don't wait first navigation, we would try to redirect to the same route /transaction/new -> /transaction/new
     * and nothing would happen.
     */
    protected override postCreate(object: CreateTransaction['createTransaction']): Observable<unknown> {
        this.updateTransactionLines = false;
        this.accountingDocuments.save(object);
        this.router.events
            .pipe(
                filter((event): event is NavigationEnd => event instanceof NavigationEnd),
                first(),
            )
            .subscribe(event => {
                if (/^\/admin\/transaction\/\d+$/.exec(event.url)) {
                    this.goToNew();
                }
            });

        return EMPTY;
    }

    private goToNew(): void {
        this.router.navigateByUrl('/admin/transaction/new');
    }
}
