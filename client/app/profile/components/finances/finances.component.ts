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
import {ifValid, NaturalAbstractController, NaturalAlertService, NaturalDataSource} from '@ecodev/natural';
import {TransactionLineService} from '../../../admin/transactions/services/transactionLine.service';
import {finalize} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {iban as ibanValidator} from '../../../shared/validators';
import {friendlyFormatIBAN} from 'ibantools';

@Component({
    selector: 'app-finances',
    templateUrl: './finances.component.html',
    styleUrls: ['./finances.component.scss'],
})
export class FinancesComponent extends NaturalAbstractController implements OnInit, OnChanges, OnDestroy {
    @Input() public user!: CurrentUserForProfile_viewer;

    public runningExpenseClaimsDS!: NaturalDataSource<ExpenseClaims_expenseClaims>;
    public expenseClaimsColumns = ['name', 'latestModification', 'status', 'type', 'remarks', 'amount', 'cancel'];

    public ibanLocked = true;

    public adminMode = false;
    public readonly deleting = new Set<string>();
    public updating = false;
    public readonly ibanCtrl = new FormControl('', ibanValidator);
    public canCreateExpenseClaim = false;

    constructor(
        private userService: UserService,
        private readonly route: ActivatedRoute,
        private readonly expenseClaimService: ExpenseClaimService,
        private readonly transactionLineService: TransactionLineService,
        private readonly alertService: NaturalAlertService,
        private readonly dialog: MatDialog,
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
        this.ibanCtrl.setValue(friendlyFormatIBAN(this.user.iban), {emitEvent: false});
        if (this.ibanCtrl.value) {
            this.canCreateExpenseClaim = true;
        }
        this.lockIbanIfDefined();
        this.ibanLocked = !!this.user.iban;
        const runningExpenseClaims = this.expenseClaimService.getForUser(this.user, this.ngUnsubscribe);
        this.runningExpenseClaimsDS = new NaturalDataSource(runningExpenseClaims);
    }

    public cancelExpenseClaim(expenseClaim: ExpenseClaims_expenseClaims_items): void {
        this.alertService
            .confirm(`Suppression`, `Veux-tu supprimer définitivement cet élément ?`, `Supprimer définitivement`)
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
                        this.alertService.info('Ta demande de remboursement a été enregistrée');
                    });
                }
            });
    }

    public updateIban(): void {
        ifValid(this.ibanCtrl).subscribe(() => {
            this.updating = true;
            this.canCreateExpenseClaim = false;
            this.ibanCtrl.enable();
            const iban = this.ibanCtrl.value;
            this.userService
                .updatePartially({id: this.user.id, iban: iban})
                .pipe(
                    finalize(() => {
                        this.updating = false;
                    }),
                )
                .subscribe({
                    next: user => {
                        this.alertService.info('Ton IBAN a été modifié');
                        this.ibanCtrl.setValue(friendlyFormatIBAN(user.iban), {emitEvent: false});

                        // if we removed the IBAN keep the field unlocked
                        if (!user.iban) {
                            this.ibanCtrl.enable();
                        } else {
                            this.canCreateExpenseClaim = true;
                        }
                    },
                    error: () => {
                        // If something wrong happend, unlock the input to suggest to the user to try again
                        this.ibanCtrl.enable();
                    },
                });
        });
    }

    public lockIbanIfDefined(): void {
        ifValid(this.ibanCtrl).subscribe(() => {
            if (this.ibanCtrl.value) {
                this.ibanCtrl.disable();
            }
        });
    }
}
