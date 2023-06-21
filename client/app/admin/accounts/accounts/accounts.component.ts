import {Component, Injector, OnInit} from '@angular/core';
import {AvailableColumn, Button, NaturalAbstractNavigableList} from '@ecodev/natural';
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
import {map} from 'rxjs/operators';

type AccountingDialogData = never;
type AccountingDialogResult = Date;

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss'],
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
                    click: (): void => this.showExport(),
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
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        private readonly accountService: AccountService,
        private readonly dialog: MatDialog,
        public readonly permissionsService: PermissionsService,
        public readonly transactionLineService: TransactionLineService,
        public readonly userService: UserService,
    ) {
        super(accountService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get('accounts');
    }

    public addLink(): any[] {
        let route: any[] = ['/admin/account/new'];
        const parentId = this.route.snapshot.params['parent'];
        if (parentId) {
            route = route.concat([{parent: parentId}]);
        }
        return route;
    }

    public formatName(name: string): string {
        return name.trim() || '<aucun>';
    }

    public showExport(): void {
        this.dialog
            .open<AccountingReportComponent, AccountingDialogData, AccountingDialogResult>(
                AccountingReportComponent,
                this.dialogConfig,
            )
            .afterClosed()
            .subscribe(date => {
                if (date) {
                    this.accountService.getReportExportLink(date).subscribe(url => {
                        window.location.href = url;
                    });
                }
            });
    }

    public showClosing(): void {
        this.dialog
            .open<AccountingClosingComponent, AccountingDialogData, AccountingDialogResult>(
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
