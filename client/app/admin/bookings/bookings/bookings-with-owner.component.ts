import {Component, inject} from '@angular/core';
import {bookingsForBookable} from '../../../shared/natural-search/natural-search-facets';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {BookingWithOwnerService} from '../services/booking-with-owner.service';
import {AbstractBookings} from './abstract-bookings';
import {
    Button,
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
import {CopyContactDataButtonService} from '../../../shared/components/copy-contact-data/copy-contact-data-button.service';
import {BookingsWithOwnerContactVariables} from '../../../shared/generated-types';
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

@Component({
    selector: 'app-bookings-with-owner',
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
export class BookingsWithOwnerComponent extends AbstractBookings<BookingWithOwnerService> {
    public readonly permissionsService = inject(PermissionsService);
    private readonly copyContactDataButtonService =
        inject<CopyContactDataButtonService<BookingsWithOwnerContactVariables>>(CopyContactDataButtonService);

    public override readonly buttons: Button[] = this.copyContactDataButtonService.getButtons(
        this.variablesManager,
        'bookingsWithOwnerContact',
    );

    public constructor() {
        super(inject(BookingWithOwnerService));
        this.naturalSearchFacets = bookingsForBookable();
    }
}
