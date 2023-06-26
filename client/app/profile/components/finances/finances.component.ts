import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {CurrentUserForProfile, ExpenseClaims, ExpenseClaimType} from '../../../shared/generated-types';
import {UserService} from '../../../admin/users/services/user.service';
import {ExpenseClaimService} from '../../../admin/expenseClaim/services/expenseClaim.service';
import {MatDialog} from '@angular/material/dialog';
import {CreateRefundComponent} from '../create-refund/create-refund.component';
import {ifValid, NaturalAbstractList} from '@ecodev/natural';
import {TransactionLineService} from '../../../admin/transactions/services/transactionLine.service';
import {finalize} from 'rxjs/operators';
import {UntypedFormControl} from '@angular/forms';
import {iban as ibanValidator} from '../../../shared/validators';
import {friendlyFormatIBAN} from 'ibantools';

@Component({
    selector: 'app-finances',
    templateUrl: './finances.component.html',
    styleUrls: ['./finances.component.scss'],
})
export class FinancesComponent
    extends NaturalAbstractList<ExpenseClaimService>
    implements OnInit, OnChanges, OnDestroy
{
    @Input({required: true}) public viewer!: NonNullable<CurrentUserForProfile['viewer']>;

    public override selectedColumns = ['name', 'updateDate', 'status', 'type', 'remarks', 'amount', 'cancel'];

    public ibanLocked = true;

    public adminMode = false;
    public readonly deleting = new Set<string>();
    public updating = false;
    public readonly ibanCtrl = new UntypedFormControl('', ibanValidator);
    public canCreateExpenseClaim = false;
    public override persistSearch = false;

    public constructor(
        private readonly userService: UserService,
        private readonly expenseClaimService: ExpenseClaimService,
        private readonly transactionLineService: TransactionLineService,
        private readonly dialog: MatDialog,
    ) {
        super(expenseClaimService);
    }

    public override ngOnInit(): void {
        if (!this.viewer) {
            this.viewer = this.route.snapshot.data.viewer.model;
        } else {
            this.adminMode = true;
            this.selectedColumns.push('admin');
        }

        super.ngOnInit();

        this.loadData();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        const previousUser = changes.viewer?.previousValue;
        if (previousUser && previousUser.id !== this.viewer.id) {
            this.loadData();
        }
    }

    private loadData(): void {
        this.ibanCtrl.setValue(friendlyFormatIBAN(this.viewer.iban), {emitEvent: false});
        if (this.ibanCtrl.value) {
            this.canCreateExpenseClaim = true;
        }
        this.lockIbanIfDefined();
        this.ibanLocked = !!this.viewer.iban;

        this.variablesManager.set('forUser', this.expenseClaimService.getForUserVariables(this.viewer));
    }

    public cancelExpenseClaim(expenseClaim: ExpenseClaims['expenseClaims']['items'][0]): void {
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
                confirmText: $localize`Envoyer la demande`,
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
                .updatePartially({id: this.viewer.id, iban: iban})
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
