import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd} from '@angular/router';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {TransactionService} from '../services/transaction.service';
import {EMPTY, Observable, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {
    CreateTransaction_createTransaction,
    CurrentUserForProfile_viewer,
    ExpenseClaim,
    ExpenseClaimType,
    UpdateTransaction_updateTransaction,
} from '../../../shared/generated-types';
import {BookableService} from '../../bookables/services/bookable.service';
import {EditableTransactionLinesComponent} from '../editable-transaction-lines/editable-transaction-lines.component';
import {TransactionLineService} from '../services/transactionLine.service';
import {AccountingDocumentsComponent} from '../../accounting-documents/accounting-documents.component';
import {UserService} from '../../users/services/user.service';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent extends NaturalAbstractDetail<TransactionService> implements OnInit {
    @ViewChild(EditableTransactionLinesComponent) public transactionLinesComponent!: EditableTransactionLinesComponent;
    @ViewChild('transactionDocuments', {static: true}) private accountingDocuments!: AccountingDocumentsComponent;

    /**
     * Edition mode, allows to edit lines
     */
    public updateTransactionLines = false;

    public ExpenseClaimType = ExpenseClaimType;

    public viewer!: CurrentUserForProfile_viewer;

    public constructor(
        private readonly transactionService: TransactionService,
        injector: Injector,
        public readonly bookableService: BookableService,
        public readonly transactionLineService: TransactionLineService,
        public readonly userService: UserService,
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
            const expenseClaim: ExpenseClaim['expenseClaim'] = this.data.expenseClaim
                ? this.data.expenseClaim.model
                : null;
            if (expenseClaim && expenseClaim.id) {
                this.data.model.expenseClaim = expenseClaim;
                this.updateTransactionLines = true;

                // Set default name
                let transactionName = '';
                switch (expenseClaim.type) {
                    case ExpenseClaimType.expenseClaim:
                        transactionName = 'Traitement de la dépense "' + expenseClaim.name + '"';
                        break;
                    case ExpenseClaimType.refund:
                        transactionName = 'Remboursement de "' + expenseClaim.name + '"';
                        break;
                    case ExpenseClaimType.invoice:
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

                if (expenseClaim.owner && expenseClaim.owner.account) {
                    if (expenseClaim.type === ExpenseClaimType.expenseClaim) {
                        const preset = this.transactionService.getExpenseClaimPreset(
                            expenseClaim.owner.account,
                            expenseClaim.amount,
                        );
                        this.transactionLinesComponent.setItems(preset);
                    } else if (expenseClaim.type === ExpenseClaimType.refund) {
                        const preset = this.transactionService.getRefundPreset(
                            expenseClaim.owner.account,
                            expenseClaim.amount,
                        );
                        this.transactionLinesComponent.setItems(preset);
                    }
                }
                if (expenseClaim.type === ExpenseClaimType.invoice) {
                    const preset = this.transactionService.getInvoicePreset(transactionName, expenseClaim.amount);
                    this.transactionLinesComponent.setItems(preset);
                }
            }
        });
    }

    public save(): void {
        if (!this.userService.canUpdateTransaction(this.viewer)) {
            return;
        }

        if (this.transactionLinesComponent) {
            const rawTransactionLines = this.transactionLinesComponent.getItems();
            this.data.model.transactionLines = rawTransactionLines.map(line =>
                this.transactionLineService.getInput(line),
            );

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

    public delete(): void {
        super.delete(['/admin/transaction-line']);
    }

    protected postUpdate(model: UpdateTransaction_updateTransaction): void {
        this.accountingDocuments.save();
    }

    /**
     * Wait the creation redirection, to have an url like /transaction/123, then redirect to /transaction/new
     * If we dont wait first navigation, we would try to redirect to the same route /transaction/new -> /transaction/new
     * and nothing would happen.
     *
     */
    protected postCreate(model: CreateTransaction_createTransaction): Observable<unknown> {
        this.accountingDocuments.save();
        const expire = new Subject<void>();
        this.router.events
            .pipe(
                takeUntil(expire),
                filter(ev => ev instanceof NavigationEnd),
            )
            .subscribe(() => {
                expire.next();
                expire.complete();
                this.goToNew();
            });

        return EMPTY;
    }

    private goToNew(): void {
        this.router.navigateByUrl('/admin/transaction/new');
    }
}
