import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ExpenseClaimStatus, ExpenseClaimType } from '../../../shared/generated-types';
import { UserService } from '../../../admin/users/services/user.service';
import { ActivatedRoute } from '@angular/router';
import { ExpenseClaimService } from '../../../admin/expenseClaim/services/expenseClaim.service';
import { MatDialog } from '@angular/material';
import { CreateRefundComponent } from '../create-refund/create-refund.component';
import { NaturalAlertService } from '@ecodev/natural';
import { TransactionLineService } from '../../../admin/transactions/services/transactionLine.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NaturalAbstractController } from '@ecodev/natural';
import { NaturalDataSource } from '@ecodev/natural';

@Component({
    selector: 'app-finances',
    templateUrl: './finances.component.html',
    styleUrls: ['./finances.component.scss'],
})
export class FinancesComponent extends NaturalAbstractController implements OnInit, OnChanges, OnDestroy {

    @Input() user;

    public runningExpenseClaimsDS: NaturalDataSource;
    public expenseClaimsColumns = ['name', 'date', 'status', 'type', 'remarks', 'amount', 'cancel'];

    public ibanLocked = true;

    public adminMode = false;

    constructor(
        private userService: UserService,
        private route: ActivatedRoute,
        private expenseClaimService: ExpenseClaimService,
        private transactionLineService: TransactionLineService,
        private alertService: NaturalAlertService,
        private dialog: MatDialog) {
        super();
    }

    ngOnInit() {
        if (!this.user) {
            this.user = this.route.snapshot.data.viewer.model;
        } else {
            this.adminMode = true;
            this.expenseClaimsColumns.push('admin');
        }

        this.loadData();
    }

    ngOnChanges(changes: SimpleChanges) {
        const previousUser = changes.user.previousValue;
        if (previousUser && previousUser.id !== this.user.id) {
            this.loadData();
        }
    }

    public loadData() {
        this.ibanLocked = !!this.user.iban;
        const runningExpenseClaims = this.expenseClaimService.getForUser(this.user, this.ngUnsubscribe);
        this.runningExpenseClaimsDS = new NaturalDataSource(runningExpenseClaims);
    }

    public cancelExpenseClaim(expenseClaim) {
        if (this.canCancelExpenseClaim(expenseClaim)) {
            this.expenseClaimService.delete([expenseClaim]).subscribe();
        }
    }

    public canCancelExpenseClaim(expenseClaim) {
        return expenseClaim.status === ExpenseClaimStatus.new;
    }

    public createRefund() {

        const config = {
            data: {
                confirmText: 'Envoyer la demande',
            },
        };
        this.dialog.open(CreateRefundComponent, config).afterClosed().subscribe(expense => {
            if (expense) {
                expense.type = ExpenseClaimType.refund;
                this.expenseClaimService.create(expense).subscribe(() => {
                    this.alertService.info('Votre demande de remboursement a bien été enregistrée');
                });
            }
        });

    }

    public updateIban(iban: string) {
        this.userService.updatePartially({id: this.user.id, iban: iban}).pipe(catchError(() => {
            this.alertService.error('L\'IBAN est invalide');
            return of(null);
        })).subscribe(user => {
            if (user) {
                this.ibanLocked = true;
                this.alertService.info('Votre IBAN a été modifié');
                this.user.iban = iban;
                this.lockIbanIfDefined();
            } else {
                this.ibanLocked = false;
            }
        });
    }

    public lockIbanIfDefined() {
        if (this.user.iban) {
            this.ibanLocked = true;
        }
    }

}
