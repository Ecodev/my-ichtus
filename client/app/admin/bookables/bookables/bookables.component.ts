import {Component, EventEmitter, inject, OnInit, Output} from '@angular/core';
import {bookables, equipment} from '../../../shared/natural-search/natural-search-facets.service';
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
import {
    NaturalAvatarComponent,
    NaturalColumnsPickerComponent,
    NaturalFileComponent,
    NaturalFixedButtonComponent,
    NaturalSearchComponent,
    NaturalTableButtonComponent,
} from '@ecodev/natural';
import {CommonModule, DatePipe} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    selector: 'app-bookables',
    templateUrl: './bookables.component.html',
    styleUrl: './bookables.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        NaturalColumnsPickerComponent,
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
        DatePipe,
    ],
})
export class BookablesComponent extends ParentComponent<BookableService> implements OnInit {
    public readonly permissionsService = inject(PermissionsService);

    @Output() public readonly bookableClick = new EventEmitter<Bookables['bookables']['items'][0]>();

    public constructor() {
        const bookableService = inject(BookableService);
        const dialog = inject(MatDialog);
        const snackbar = inject(MatSnackBar);
        const bookingService = inject(BookingService);

        super(bookableService, dialog, snackbar, bookingService);
        this.naturalSearchFacets = this.route.snapshot.data.isEquipment ? equipment() : bookables();
    }

    public select(element: Bookables['bookables']['items'][0]): void {
        this.bookableClick.emit(element);
    }
}
