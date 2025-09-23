import {Component, inject, OnInit} from '@angular/core';
import {
    AvailableColumn,
    Button,
    NaturalAbstractNavigableList,
    NaturalAvatarComponent,
    NaturalColumnsPickerComponent,
    NaturalEnumPipe,
    NaturalFixedButtonComponent,
    NaturalSearchComponent,
    NaturalTableButtonComponent,
} from '@ecodev/natural';
import {AsyncPipe, DatePipe} from '@angular/common';
import {AccountType, CurrentUserForProfile} from '../../../shared/generated-types';
import {accounts} from '../../../shared/natural-search/natural-search-facets';
import {AccountService} from '../services/account.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {TransactionLineService} from '../../transactions/services/transactionLine.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {UserService} from '../../users/services/user.service';
import {AccountingClosingComponent} from '../accounting-closing/accounting-closing.component';
import {AccountingReportComponent} from '../accounting-report/accounting-report.component';
import {Observable} from 'rxjs';
import {finalize, map} from 'rxjs/operators';
import {IbanPipe} from '../../../shared/pipes/iban.pipe';
import {MatPaginator} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {MatTooltip} from '@angular/material/tooltip';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
} from '@angular/material/table';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';

type AccountingDialogData = never;
type AccountingClosingDialogResult = Date;
type AccountingExportDialogResult = {
    date: Date;
    datePrevious: null | Date;
    showBudget: boolean;
};

@Component({
    selector: 'app-accounts',
    imports: [
        AsyncPipe,
        DatePipe,
        RouterLink,
        MatButton,
        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTable,
        MatHeaderCellDef,
        MatHeaderRowDef,
        MatColumnDef,
        MatCellDef,
        MatRowDef,
        MatHeaderCell,
        MatCell,
        MatHeaderRow,
        MatRow,
        MatSort,
        MatSortHeader,
        NaturalTableButtonComponent,
        MatTooltip,
        NaturalAvatarComponent,
        MoneyComponent,
        MatProgressSpinner,
        MatPaginator,
        NaturalFixedButtonComponent,
        NaturalEnumPipe,
        IbanPipe,
    ],
    templateUrl: './accounts.component.html',
    styleUrl: './accounts.component.scss',
})
export class AccountsComponent extends NaturalAbstractNavigableList<AccountService> implements OnInit {
    private readonly dialog = inject(MatDialog);
    public readonly permissionsService = inject(PermissionsService);
    public readonly transactionLineService = inject(TransactionLineService);
    public readonly userService = inject(UserService);

    public override availableColumns: AvailableColumn[] = [
        {id: 'navigation', label: 'Navigation'},
        {id: 'code', label: 'Code'},
        {id: 'name', label: 'Nom'},
        {id: 'type', label: 'Type', checked: false},
        {id: 'owner', label: 'Utilisateur', checked: false},
        {id: 'iban', label: 'IBAN', checked: false},
        {id: 'totalBalance', label: 'Solde'},
        {id: 'totalBalanceFormer', label: 'Solde précédent'},
        {id: 'budgetAllowed', label: 'Budget prévu'},
        {id: 'budgetBalance', label: 'Budget restant'},
        {id: 'creationDate', label: 'Créé le', checked: false},
        {id: 'updateDate', label: 'Modifié le', checked: false},
    ];

    public readonly buttons: Observable<Button[]> = this.route.data.pipe(
        map(routeData => {
            const viewer: NonNullable<CurrentUserForProfile['viewer']> = routeData.viewer;

            return [
                {
                    label: `Exporter rapport comptable`,
                    icon: 'file_download',
                    click: (button: Button): void => this.export(button),
                },
                {
                    label: `Bouclement comptable`,
                    icon: 'account_balance',
                    show: this.userService.canCloseAccounting(viewer),
                    click: (): void => this.showClosing(),
                },
            ];
        }),
    );

    public viewer!: NonNullable<CurrentUserForProfile['viewer']>;
    private dialogConfig: MatDialogConfig<AccountingDialogData> = {
        minWidth: '400px',
        maxWidth: '60vw',
    };

    public constructor() {
        super(inject(AccountService));

        this.naturalSearchFacets = accounts();
    }

    public addLink(): any[] {
        let route: any[] = ['/admin/account/new'];
        const parentId = this.route.snapshot.params.parent;
        if (parentId) {
            route = route.concat([{parent: parentId}]);
        }
        return route;
    }

    public formatName(name: string): string {
        return name.trim() || '<aucun>';
    }

    public export(button: Button): void {
        this.dialog
            .open<AccountingReportComponent, AccountingDialogData, AccountingExportDialogResult>(
                AccountingReportComponent,
                this.dialogConfig,
            )
            .afterClosed()
            .subscribe(result => {
                if (result) {
                    button.disabled = true;
                    this.service
                        .getReportExportLink(result.date, result.datePrevious, result.showBudget)
                        .pipe(finalize(() => (button.disabled = false)))
                        .subscribe(url => {
                            window.location.href = url;
                        });
                }
            });
    }

    public showClosing(): void {
        this.dialog
            .open<AccountingClosingComponent, AccountingDialogData, AccountingClosingDialogResult>(
                AccountingClosingComponent,
                this.dialogConfig,
            )
            .afterClosed()
            .subscribe(date => {
                if (date) {
                    this.service.closing(date).subscribe(transaction => {
                        if (transaction) {
                            this.router.navigate(['../transaction/', transaction.id], {relativeTo: this.route});
                        }
                    });
                }
            });
    }

    protected readonly AccountType = AccountType;
}
