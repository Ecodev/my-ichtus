import {Component} from '@angular/core';
import {SafetyBookingService} from './safety-booking.service';
import {NaturalSearchFacetsService} from '../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../shared/services/permissions.service';
import {AbstractBookings} from '../admin/bookings/bookings/abstract-bookings';
import {RouterLink} from '@angular/router';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {FlagComponent} from '../shared/components/flag/flag.component';
import {MoneyComponent} from '../shared/components/money/money.component';
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
    selector: 'app-safety',
    templateUrl: '../admin/bookings/bookings/bookings.component.html',
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
export class SafetyComponent extends AbstractBookings<SafetyBookingService> {
    public constructor(
        safetyBookingService: SafetyBookingService,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
    ) {
        super(safetyBookingService);
        this.naturalSearchFacets = naturalSearchFacetsService.get('bookings');
    }
}
