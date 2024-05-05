import {Component} from '@angular/core';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {BookingWithOwnerService} from '../services/booking-with-owner.service';
import {AbstractBookings} from './abstract-bookings';
import {
    Button,
    NaturalColumnsPickerComponent,
    NaturalSearchComponent,
    NaturalTableButtonComponent,
    NaturalAvatarComponent,
    NaturalFileComponent,
    NaturalIconDirective,
    NaturalFixedButtonComponent,
    NaturalCapitalizePipe,
    NaturalEnumPipe,
    NaturalSwissDatePipe,
    NaturalEllipsisPipe,
} from '@ecodev/natural';
import {CopyContactDataButtonService} from '../../../shared/components/copy-contact-data/copy-contact-data-button.service';
import {BookingsWithOwnerContactVariables} from '../../../shared/generated-types';
import {RouterLink} from '@angular/router';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {FlagComponent} from '../../../shared/components/flag/flag.component';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';

import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-bookings-with-owner',
    templateUrl: './bookings.component.html',
    styleUrl: './bookings.component.scss',
    standalone: true,
    imports: [
        CommonModule,

        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTableModule,
        MatSortModule,
        NaturalTableButtonComponent,
        MatTooltipModule,
        NaturalAvatarComponent,
        NaturalFileComponent,
        MatButtonModule,
        MatIconModule,
        NaturalIconDirective,
        MoneyComponent,
        FlagComponent,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        NaturalFixedButtonComponent,
        RouterLink,
        NaturalCapitalizePipe,
        NaturalEnumPipe,
        NaturalSwissDatePipe,
        NaturalEllipsisPipe,
    ],
})
export class BookingsWithOwnerComponent extends AbstractBookings<BookingWithOwnerService> {
    public override readonly buttons: Button[] = this.copyContactDataButtonService.getButtons(
        this.variablesManager,
        'bookingsWithOwnerContact',
    );

    public constructor(
        bookingWithOwnerService: BookingWithOwnerService,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
        private readonly copyContactDataButtonService: CopyContactDataButtonService<BookingsWithOwnerContactVariables>,
    ) {
        super(bookingWithOwnerService);
        this.naturalSearchFacets = naturalSearchFacetsService.get('bookingsForBookable');
    }
}
