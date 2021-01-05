import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {
    CurrentUserForProfile_viewer,
    ExpenseClaims_expenseClaims,
    ExpenseClaims_expenseClaims_items,
    ExpenseClaimType,
} from '../../../shared/generated-types';
import {UserService} from '../../../admin/users/services/user.service';
import {ActivatedRoute} from '@angular/router';
import {ExpenseClaimService} from '../../../admin/expenseClaim/services/expenseClaim.service';
import {MatDialog} from '@angular/material/dialog';
import {CreateRefundComponent} from '../create-refund/create-refund.component';
import {NaturalAbstractController, NaturalAlertService, NaturalDataSource} from '@ecodev/natural';
import {TransactionLineService} from '../../../admin/transactions/services/transactionLine.service';
import {catchError} from 'rxjs/operators';
import {of} from 'rxjs';

@Component({
    selector: 'app-finances',
    templateUrl: './finances.component.html',
    styleUrls: ['./finances.component.scss'],
})
export class FinancesComponent extends NaturalAbstractController implements OnInit, OnChanges, OnDestroy {
    @Input() public user!: CurrentUserForProfile_viewer;

    public runningExpenseClaimsDS!: NaturalDataSource<ExpenseClaims_expenseClaims>;
    public expenseClaimsColumns = ['name', 'date', 'status', 'type', 'remarks', 'amount', 'cancel'];

    public ibanLocked = true;

    public adminMode = false;
    public readonly deleting = new Set<string>();

    constructor(
        private userService: UserService,
        private route: ActivatedRoute,
        private expenseClaimService: ExpenseClaimService,
        private transactionLineService: TransactionLineService,
        private alertService: NaturalAlertService,
        private dialog: MatDialog,
    ) {
        super();
    }

    public ngOnInit(): void {
        if (!this.user) {
            this.user = this.route.snapshot.data.viewer.model;
        } else {
            this.adminMode = true;
            this.expenseClaimsColumns.push('admin');
        }

        this.loadData();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        const previousUser = changes.user.previousValue;
        if (previousUser && previousUser.id !== this.user.id) {
            this.loadData();
        }
    }

    public loadData(): void {
        this.ibanLocked = !!this.user.iban;
        const runningExpenseClaims = this.expenseClaimService.getForUser(this.user, this.ngUnsubscribe);
        this.runningExpenseClaimsDS = new NaturalDataSource(runningExpenseClaims);
    }

    public cancelExpenseClaim(expenseClaim: ExpenseClaims_expenseClaims_items): void {
        this.alertService
            .confirm(`Suppression`, `Voulez-vous supprimer définitivement cet élément ?`, `Supprimer définitivement`)
            .subscribe(confirmed => {
                if (confirmed) {
                    this.deleting.add(expenseClaim.id);

                    this.expenseClaimService.delete([expenseClaim]).subscribe({
                        next: () => {
                            this.alertService.info(`Supprimé`);
                        },
                        error: () => this.deleting.delete(expenseClaim.id),
                    });
                }
            });
    }

    public createRefund(): void {
        const config = {
            data: {
                confirmText: 'Envoyer la demande',
            },
        };
        this.dialog
            .open(CreateRefundComponent, config)
            .afterClosed()
            .subscribe(expense => {
                if (expense) {
                    expense.type = ExpenseClaimType.refund;
                    this.expenseClaimService.create(expense).subscribe(() => {
                        this.alertService.info('Votre demande de remboursement a bien été enregistrée');
                    });
                }
            });
    }

    public updateIban(): void {
        const iban = this.user.iban;
        this.userService
            .updatePartially({id: this.user.id, iban: iban})
            .pipe(
                catchError(() => {
                    this.alertService.error("L'IBAN est invalide");
                    return of(null);
                }),
            )
            .subscribe(user => {
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

    public lockIbanIfDefined(): void {
        if (this.user.iban) {
            this.ibanLocked = true;
        }
    }
}
