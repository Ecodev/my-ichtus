import {Component} from '@angular/core';
import {BookingService} from '../services/booking.service';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {AbstractBookings} from './abstract-bookings';
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
import {
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
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-bookings',
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
export class BookingsComponent extends AbstractBookings<BookingService> {
    public constructor(
        bookingService: BookingService,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
    ) {
        super(bookingService);
        this.naturalSearchFacets = naturalSearchFacetsService.get(
            this.route.snapshot.data.advancedFacets ? 'bookingsAdvanced' : 'bookings',
        );
    }
}
