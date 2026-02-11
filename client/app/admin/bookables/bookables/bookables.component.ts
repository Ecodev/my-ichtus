import {Component, inject, OnInit, output} from '@angular/core';
import {bookables, equipment} from '../../../shared/natural-search/natural-search-facets';
import {BookablesQuery, BookableStatus} from '../../../shared/generated-types';
import {BookableService} from '../services/bookable.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {ParentComponent} from './parent.component';
import {MatPaginator} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {FlagComponent} from '../../../shared/components/flag/flag.component';
import {MatTooltip} from '@angular/material/tooltip';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {
    NaturalAvatarComponent,
    NaturalColumnsPickerComponent,
    NaturalFileComponent,
    NaturalFixedButtonComponent,
    NaturalSearchComponent,
    NaturalTableButtonComponent,
    TypedMatCellDef,
} from '@ecodev/natural';
import {
    MatCell,
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
import {AsyncPipe, CurrencyPipe, DatePipe} from '@angular/common';

@Component({
    selector: 'app-bookables',
    imports: [
        AsyncPipe,
        CurrencyPipe,
        DatePipe,
        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTable,
        MatHeaderCellDef,
        MatHeaderRowDef,
        MatColumnDef,
        TypedMatCellDef,
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
export class BookablesComponent extends ParentComponent<BookableService> implements OnInit {
    protected readonly permissionsService = inject(PermissionsService);

    protected readonly bookableClick = output<BookablesQuery['bookables']['items'][0]>();
    protected readonly BookableStatus = BookableStatus;

    public constructor() {
        super(inject(BookableService));
        this.naturalSearchFacets = this.route.snapshot.data.isEquipment ? equipment() : bookables();
    }

    protected select(element: BookablesQuery['bookables']['items'][0]): void {
        this.bookableClick.emit(element);
    }
}
