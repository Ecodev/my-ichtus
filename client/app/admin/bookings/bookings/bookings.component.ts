import {Component, inject} from '@angular/core';
import {BookingService} from '../services/booking.service';
import {bookings, bookingsAdvanced} from '../../../shared/natural-search/natural-search-facets';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {AbstractBookings} from './abstract-bookings';
import {RouterLink} from '@angular/router';
import {MatPaginator} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {FlagComponent} from '../../../shared/components/flag/flag.component';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
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
} from '@ecodev/natural';
import {AsyncPipe, DatePipe} from '@angular/common';

@Component({
    selector: 'app-bookings',
    imports: [
        AsyncPipe,
        DatePipe,
        FlagComponent,
        MatButton,
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
        MatIcon,
        MatPaginator,
        MatProgressSpinner,
        MatRow,
        MatRowDef,
        MatSort,
        MatSortHeader,
        MatTable,
        MatTooltip,
        MoneyComponent,
        NaturalAvatarComponent,
        NaturalColumnsPickerComponent,
        NaturalEllipsisPipe,
        NaturalEnumPipe,
        NaturalFileComponent,
        NaturalFixedButtonComponent,
        NaturalIconDirective,
        NaturalSearchComponent,
        NaturalTableButtonComponent,
        RouterLink,
    ],
    templateUrl: './bookings.component.html',
    styleUrl: './bookings.component.scss',
})
export class BookingsComponent extends AbstractBookings<BookingService> {
    public readonly permissionsService = inject(PermissionsService);

    public constructor() {
        super(inject(BookingService));
        this.naturalSearchFacets = this.route.snapshot.data.advancedFacets ? bookingsAdvanced() : bookings();
    }
}
