import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {Bookables} from '../../../shared/generated-types';
import {BookableService} from '../services/bookable.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {ParentComponent} from './parent.component';
import {BookingService} from '../../bookings/services/booking.service';

@Component({
    selector: 'app-bookables',
    templateUrl: './bookables.component.html',
    styleUrls: ['./bookables.component.scss'],
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
