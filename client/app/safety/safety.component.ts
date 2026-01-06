import {Component, inject} from '@angular/core';
import {SafetyBookingService} from './safety-booking.service';
import {bookings} from '../shared/natural-search/natural-search-facets';
import {PermissionsService} from '../shared/services/permissions.service';
import {AbstractBookings} from '../admin/bookings/bookings/abstract-bookings';
import {RouterLink} from '@angular/router';
import {MatPaginator} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {FlagComponent} from '../shared/components/flag/flag.component';
import {MoneyComponent} from '../shared/components/money/money.component';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {
    NaturalAvatarComponent,
    NaturalColumnsPickerComponent,
    NaturalEllipsisPipe,
    NaturalEnumPipe,
    NaturalFileComponent,
    NaturalFixedButtonComponent,
    NaturalIconDirective,
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
import {AsyncPipe, DatePipe} from '@angular/common';

@Component({
    selector: 'app-safety',
    imports: [
        AsyncPipe,
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
        NaturalTableButtonComponent,
        MatTooltip,
        NaturalAvatarComponent,
        NaturalFileComponent,
        MatButton,
        MatIcon,
        NaturalIconDirective,
        MoneyComponent,
        FlagComponent,
        MatProgressSpinner,
        MatPaginator,
        NaturalFixedButtonComponent,
        RouterLink,
        NaturalEnumPipe,
        NaturalEllipsisPipe,
    ],
    templateUrl: '../admin/bookings/bookings/bookings.component.html',
})
export class SafetyComponent extends AbstractBookings<SafetyBookingService> {
    protected readonly permissionsService = inject(PermissionsService);

    public constructor() {
        super(inject(SafetyBookingService));
        this.naturalSearchFacets = bookings();
    }
}
