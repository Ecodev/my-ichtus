import {Component, inject} from '@angular/core';
import {BookingService} from '../services/booking.service';
import {bookings, bookingsAdvanced} from '../../../shared/natural-search/natural-search-facets';
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
import {CommonModule, DatePipe} from '@angular/common';

@Component({
    selector: 'app-bookings',
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
        NaturalEnumPipe,
        DatePipe,
        NaturalEllipsisPipe,
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
