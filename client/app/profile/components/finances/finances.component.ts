import {Component, inject, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {CurrentUserForProfile, ExpenseClaims, ExpenseClaimType} from '../../../shared/generated-types';
import {UserService} from '../../../admin/users/services/user.service';
import {ExpenseClaimService} from '../../../admin/expenseClaim/services/expenseClaim.service';
import {MatDialog} from '@angular/material/dialog';
import {CreateRefundComponent} from '../create-refund/create-refund.component';
import {ifValid, NaturalAbstractList, NaturalEnumPipe, NaturalIconDirective} from '@ecodev/natural';
import {finalize} from 'rxjs/operators';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {iban as ibanValidator} from '../../../shared/validators';
import {friendlyFormatIBAN} from 'ibantools';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-finances',
    templateUrl: './finances.component.html',
    styleUrl: './finances.component.scss',
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        NaturalIconDirective,
        RouterLink,
        MatTableModule,
        MatSortModule,
        MoneyComponent,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        NaturalEnumPipe,
    ],
})
export class FinancesComponent extends NaturalAbstractList<ExpenseClaimService> implements OnInit, OnChanges {
    private readonly userService = inject(UserService);
    private readonly dialog = inject(MatDialog);

    @Input({required: true}) public viewer!: NonNullable<CurrentUserForProfile['viewer']>;

    public override selectedColumns = ['name', 'updateDate', 'status', 'type', 'remarks', 'amount', 'cancel'];

    public ibanLocked = true;

    public adminMode = false;
    public readonly deleting = new Set<string>();
    public updating = false;
    public readonly ibanCtrl = new FormControl('', ibanValidator);
    public canCreateExpenseClaim = false;
    public override persistSearch = false;

    public constructor() {
        super(inject(ExpenseClaimService));
    }

    public ngOnChanges(changes: SimpleChanges): void {
        const previousUser = changes.viewer?.previousValue;
        if (previousUser && previousUser.id !== this.viewer.id) {
            this.loadData();
        }
    }

    public override ngOnInit(): void {
        if (!this.viewer) {
            this.viewer = this.route.snapshot.data.viewer;
        } else {
            this.adminMode = true;
            this.selectedColumns.push('admin');
        }

        super.ngOnInit();

        this.loadData();
    }

    private loadData(): void {
        this.ibanCtrl.setValue(friendlyFormatIBAN(this.viewer.iban), {emitEvent: false});
        if (this.ibanCtrl.value) {
            this.canCreateExpenseClaim = true;
        }
        this.lockIbanIfDefined();
        this.ibanLocked = !!this.viewer.iban;

        this.variablesManager.set('forUser', this.service.getForUserVariables(this.viewer));
    }

    public cancelExpenseClaim(expenseClaim: ExpenseClaims['expenseClaims']['items'][0]): void {
        this.alertService
            .confirm(`Suppression`, `Veux-tu supprimer définitivement cet élément ?`, `Supprimer définitivement`)
            .subscribe(confirmed => {
                if (confirmed) {
                    this.deleting.add(expenseClaim.id);

                    this.service.delete([expenseClaim]).subscribe({
                        next: () => {
                            this.alertService.info(`Supprimé`);
                        },
                        error: () => this.deleting.delete(expenseClaim.id),
                    });
                }
            });
    }

    public createRefund(): void {
        this.dialog
            .open<CreateRefundComponent, never>(CreateRefundComponent)
            .afterClosed()
            .subscribe(expense => {
                if (expense) {
                    expense.type = ExpenseClaimType.Refund;
                    this.service.create(expense).subscribe(() => {
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
                .updateNow({id: this.viewer.id, iban: iban})
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
