import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {Bookables} from '../../../shared/generated-types';
import {BookableService} from '../services/bookable.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {ParentComponent} from './parent.component';
import {BookingService} from '../../bookings/services/booking.service';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {FlagComponent} from '../../../shared/components/flag/flag.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {ExtendedModule} from '@ngbracket/ngx-layout/extended';
import {
    NaturalColumnsPickerComponent,
    NaturalSearchComponent,
    NaturalFileComponent,
    NaturalTableButtonComponent,
    NaturalAvatarComponent,
    NaturalFixedButtonComponent,
    NaturalSwissDatePipe,
} from '@ecodev/natural';
import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-bookables',
    templateUrl: './bookables.component.html',
    styleUrls: ['./bookables.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FlexModule,
        NaturalColumnsPickerComponent,
        ExtendedModule,
        NaturalSearchComponent,
        MatTableModule,
        MatSortModule,
        NaturalFileComponent,
        NaturalTableButtonComponent,
        MatTooltipModule,
        FlagComponent,
        NaturalAvatarComponent,
        MatButtonModule,
        RouterLink,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        NaturalFixedButtonComponent,
        NaturalSwissDatePipe,
    ],
})
export class BookablesComponent extends ParentComponent<BookableService> implements OnInit {
    @Output() public readonly bookableClick = new EventEmitter<Bookables['bookables']['items'][0]>();

    public constructor(
        bookableService: BookableService,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
        bookingService: BookingService,
    ) {
        super(bookableService, bookingService);
        this.naturalSearchFacets = naturalSearchFacetsService.get(
            this.route.snapshot.data.isEquipment ? 'equipment' : 'bookables',
        );
    }

    public select(element: Bookables['bookables']['items'][0]): void {
        this.bookableClick.emit(element);
    }
}
