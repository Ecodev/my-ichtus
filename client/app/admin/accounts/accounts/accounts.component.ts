import {Component, Injector, OnInit} from '@angular/core';
import {NaturalAbstractNavigableList} from '@ecodev/natural';
import {Accounts, AccountsVariables, CurrentUserForProfile_viewer} from '../../../shared/generated-types';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {AccountService} from '../services/account.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {TransactionLineService} from '../../transactions/services/transactionLine.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {UserService} from '../../users/services/user.service';
import {AccountingClosingComponent} from '../accounting-closing/accounting-closing.component';
import {AccountingReportComponent} from '../accounting-report/accounting-report.component';

type AccountingDialogData = never;
type AccountingDialogResult = Date;

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent extends NaturalAbstractNavigableList<AccountService> implements OnInit {
    public initialColumns = ['navigation', 'code', 'name', 'totalBalance'];
    public viewer!: CurrentUserForProfile_viewer;
    private dialogConfig: MatDialogConfig<AccountingDialogData> = {
        minWidth: '400px',
        maxWidth: '60vw',
    };

    constructor(
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        private accountService: AccountService,
        private dialog: MatDialog,
        public permissionsService: PermissionsService,
        public transactionLineService: TransactionLineService,
        public userService: UserService,
    ) {
        super(accountService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get('accounts');
    }

    public ngOnInit(): void {
        super.ngOnInit();

        this.viewer = this.route.snapshot.data.viewer.model;
    }

    public addLink(): any[] {
        let route: any[] = ['/admin/account/new'];
        const parentId = this.route.snapshot.params['parent'];
        if (parentId) {
            route = route.concat([{parent: parentId}]);
        }
        return route;
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
