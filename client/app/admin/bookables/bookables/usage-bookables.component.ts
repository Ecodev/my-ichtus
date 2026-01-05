import {Component, inject, Input, OnInit, output} from '@angular/core';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {UsageBookableService} from '../services/usage-bookable.service';
import {
    NaturalAvatarComponent,
    NaturalColumnsPickerComponent,
    NaturalFileComponent,
    NaturalFixedButtonComponent,
    NaturalSearchComponent,
    NaturalSearchSelections,
    NaturalTableButtonComponent,
} from '@ecodev/natural';
import {AsyncPipe, CurrencyPipe, DatePipe, NgClass} from '@angular/common';
import {BookableStatus, UsageBookablesQuery} from '../../../shared/generated-types';
import {switchMap} from 'rxjs/operators';
import {UserService} from '../../users/services/user.service';
import {ParentComponent} from './parent.component';
import {of} from 'rxjs';
import {MatPaginator} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {FlagComponent} from '../../../shared/components/flag/flag.component';
import {MatTooltip} from '@angular/material/tooltip';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatFooterCell,
    MatFooterCellDef,
    MatFooterRow,
    MatFooterRowDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
} from '@angular/material/table';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {admin_approved, bookables, storage} from '../../../shared/natural-search/natural-search-facets';

@Component({
    selector: 'app-usage-bookables',
    imports: [
        NgClass,
        AsyncPipe,
        CurrencyPipe,
        DatePipe,
        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTable,
        MatHeaderCellDef,
        MatHeaderRowDef,
        MatColumnDef,
        MatCellDef,
        MatRowDef,
        MatFooterCellDef,
        MatFooterRowDef,
        MatHeaderCell,
        MatCell,
        MatFooterCell,
        MatHeaderRow,
        MatRow,
        MatFooterRow,
        MatSort,
        MatSortHeader,
        NaturalFileComponent,
        NaturalTableButtonComponent,
        MatTooltip,
        FlagComponent,
        NaturalAvatarComponent,
        MatButton,
        RouterLink,
        MatProgressSpinner,
        MatPaginator,
        NaturalFixedButtonComponent,
    ],
    templateUrl: './bookables.component.html',
    styleUrl: './bookables.component.scss',
})
export class UsageBookablesComponent extends ParentComponent<UsageBookableService> implements OnInit {
    protected readonly permissionsService = inject(PermissionsService);
    private readonly userService = inject(UserService);
    protected readonly BookableStatus = BookableStatus;
    protected readonly bookableClick = output<UsageBookablesQuery['bookables']['items'][0]>();

    @Input()
    public set selections(selections: NaturalSearchSelections) {
        if (!this.searchInitialized) {
            this.naturalSearchSelections = selections;
            this.search(selections);
        }
    }

    public override readonly hasUsage = true;
    private searchInitialized = false;

    public constructor() {
        super(inject(UsageBookableService));

        if (this.route.snapshot.data.isAdmin) {
            let facets = bookables();
            switch (this.route.snapshot.data.facetsKey) {
                case 'storage':
                    facets = storage();
                    break;
                case 'admin_approved':
                    facets = admin_approved();
                    break;
            }

            this.naturalSearchFacets = facets;
        }
    }

    public override ngOnInit(): void {
        super.ngOnInit();

        if (this.route.snapshot.data.persistSearchUsageBookable === false) {
            this.persistSearch = false;
        }

        this.futureOwner$
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                switchMap(futureOwner =>
                    futureOwner ? this.userService.getPendingApplications(futureOwner) : of({items: []}),
                ),
            )
            .subscribe(result => (this.pendingApplications = result.items));
    }
}
