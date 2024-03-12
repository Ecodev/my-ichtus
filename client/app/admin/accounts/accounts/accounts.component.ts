import {Component, OnInit} from '@angular/core';
import {
    AvailableColumn,
    Button,
    NaturalAbstractNavigableList,
    NaturalColumnsPickerComponent,
    NaturalSearchComponent,
    NaturalTableButtonComponent,
    NaturalAvatarComponent,
    NaturalFixedButtonComponent,
    NaturalCapitalizePipe,
    NaturalEnumPipe,
    NaturalSwissDatePipe,
} from '@ecodev/natural';
import {CurrentUserForProfile} from '../../../shared/generated-types';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
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
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {CommonModule} from '@angular/common';

type AccountingDialogData = never;
type AccountingClosingDialogResult = Date;
type AccountingExportDialogResult = {
    date: Date;
    showBudget: boolean;
};

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrl: './accounts.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        FlexModule,
        RouterLink,
        MatButtonModule,
        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTableModule,
        MatSortModule,
        NaturalTableButtonComponent,
        MatTooltipModule,
        NaturalAvatarComponent,
        MoneyComponent,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        NaturalFixedButtonComponent,
        NaturalCapitalizePipe,
        NaturalEnumPipe,
        NaturalSwissDatePipe,
        IbanPipe,
    ],
})
export class AccountsComponent extends NaturalAbstractNavigableList<AccountService> implements OnInit {
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
            const viewer: NonNullable<CurrentUserForProfile['viewer']> = routeData.viewer.model;

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

    public constructor(
        naturalSearchFacetsService: NaturalSearchFacetsService,
        private readonly accountService: AccountService,
        private readonly dialog: MatDialog,
        public readonly permissionsService: PermissionsService,
        public readonly transactionLineService: TransactionLineService,
        public readonly userService: UserService,
    ) {
        super(accountService);
        this.naturalSearchFacets = naturalSearchFacetsService.get('accounts');
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
                    this.accountService
                        .getReportExportLink(result.date, result.showBudget)
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
                    this.accountService.closing(date).subscribe(transaction => {
                        if (transaction) {
                            this.router.navigate(['../transaction/', transaction.id], {relativeTo: this.route});
                        }
                    });
                }
            });
    }
}
