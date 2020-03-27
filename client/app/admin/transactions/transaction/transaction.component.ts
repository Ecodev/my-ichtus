import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { NaturalAbstractDetail } from '@ecodev/natural';
import { TransactionService } from '../services/transaction.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import {
    CreateTransaction,
    CreateTransactionVariables,
    DeleteTransactions,
    ExpenseClaim,
    ExpenseClaimStatus,
    ExpenseClaimType,
    Transaction,
    TransactionVariables,
    UpdateTransaction,
    UpdateTransactionVariables,
} from '../../../shared/generated-types';
import { BookableService } from '../../bookables/services/bookable.service';
import { EditableTransactionLinesComponent } from '../editable-transaction-lines/editable-transaction-lines.component';
import { TransactionLineService } from '../services/transactionLine.service';
import { AccountingDocumentsComponent } from '../../accounting-documents/accounting-documents.component';
import { ExpenseClaimService } from '../../expenseClaim/services/expenseClaim.service';
import { UserService } from '../../users/services/user.service';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent
    extends NaturalAbstractDetail<Transaction['transaction'],
        TransactionVariables,
        CreateTransaction['createTransaction'],
        CreateTransactionVariables,
        UpdateTransaction['updateTransaction'],
        UpdateTransactionVariables,
        DeleteTransactions> implements OnInit {

    @ViewChild(EditableTransactionLinesComponent) transactionLinesComponent: EditableTransactionLinesComponent;
    @ViewChild('transactionDocuments', {static: true}) accountingDocuments: AccountingDocumentsComponent;

    /**
     * Edition mode, allows to edit lines
     */
    public updateTransactionLines = false;

    public ExpenseClaimType = ExpenseClaimType;
    public ExpenseClaimStatus = ExpenseClaimStatus;

    public viewer;

    constructor(private transactionService: TransactionService,
                injector: Injector,
                public bookableService: BookableService,
                public transactionLineService: TransactionLineService,
                public userService: UserService,
                private expenseClaimService: ExpenseClaimService,
    ) {
        super('transaction', transactionService, injector);
    }

    public ngOnInit(): void {
        super.ngOnInit();

        this.viewer = this.route.snapshot.data.viewer.model;

        // Activate edition mode on creation
        if (!this.data.model.id) {
            this.updateTransactionLines = true;
        }

        setTimeout(() => {
            const expenseClaim: ExpenseClaim['expenseClaim'] = this.data.expenseClaim ? this.data.expenseClaim.model : null;
            if (expenseClaim && expenseClaim.owner && expenseClaim.owner.account) {
                this.data.model.expenseClaim = expenseClaim;
                this.updateTransactionLines = true;

                // Set default name
                const nameControl = this.form.get('name');
                if (nameControl) {
                    if (expenseClaim.type === ExpenseClaimType.expenseClaim) {
                        nameControl.setValue('Traitement de la dépense "' + expenseClaim.name + '"');
                    } else if (expenseClaim.type === ExpenseClaimType.refund) {
                        nameControl.setValue('Remboursement de "' + expenseClaim.name + '"');
                    }
                }

                const expenseClaimControl = this.form.get('expenseClaim');
                if (expenseClaimControl) {
                    expenseClaimControl.setValue(expenseClaim);
                }

                if (expenseClaim.type === ExpenseClaimType.expenseClaim) {
                    const preset = this.transactionService.getExpenseClaimPreset(expenseClaim.owner.account, expenseClaim.amount);
                    this.transactionLinesComponent.setItems(preset);
                } else if (expenseClaim.type === ExpenseClaimType.refund) {
                    const preset = this.transactionService.getRefundPreset(expenseClaim.owner.account, expenseClaim.amount);
                    this.transactionLinesComponent.setItems(preset);
                }
            }
        });
    }

    public save() {

        if (!this.userService.canUpdateTransaction(this.viewer)) {
            return;
        }

        if (this.transactionLinesComponent) {
            const rawTransactionLines = this.transactionLinesComponent.getItems();
            this.data.model.transactionLines = rawTransactionLines.map(line => this.transactionLineService.getInput(line));

            this.transactionLinesComponent.validateForm();

            if (!this.transactionLinesComponent.form.valid) {
                return;
            }
        } else {
            this.data.model.transactionLines = null;
        }

        if (this.data.model.id) {
            this.update(true);
        } else {
            this.create();
        }

        this.updateTransactionLines = false;
    }

    public flagExpenseClaim(status: ExpenseClaimStatus) {
        const model = {
            id: this.data.model.expenseClaim.id,
            status: status,
        };
        this.expenseClaimService.updatePartially(model).subscribe(() => {
            this.data.model.expenseClaim.status = status;
        });
    }

    public delete(redirectionRoute: any[]): void {
        super.delete(['/admin/transaction-line']);
    }

    protected postUpdate(model): void {
        this.accountingDocuments.save();
        this.goToNew();
    }

    /**
     * Wait the creation redirection, to have an url like /transaction/123, then redirect to /transaction/new
     * If we dont wait first navigation, we would try to redirect to the same route /transaction/new -> /transaction/new
     * and nothing would happen.
     *
     */
    protected postCreate(model): void {
        this.accountingDocuments.save();
        const expire = new Subject();
        this.router.events.pipe(takeUntil(expire), filter((ev) => ev instanceof NavigationEnd)).subscribe(() => {
            expire.next();
            expire.complete();
            this.goToNew();
        });
    }

    private goToNew() {
        this.router.navigateByUrl('/admin/transaction/new');

    }
}
