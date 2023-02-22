import {Component, EventEmitter, Injector, OnInit, Output} from '@angular/core';
import {NaturalAbstractList} from '@ecodev/natural';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {Bookables_bookables_items, UsageBookables_bookables_items} from '../../../shared/generated-types';
import {BookableService} from '../services/bookable.service';
import {PermissionsService} from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-bookables',
    templateUrl: './bookables.component.html',
    styleUrls: ['./bookables.component.scss'],
})
export class BookablesComponent extends NaturalAbstractList<BookableService> implements OnInit {
    @Output() public readonly bookableClick = new EventEmitter<Bookables_bookables_items>();
    public readonly hasUsage = false;

    public constructor(
        bookableService: BookableService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
    ) {
        super(bookableService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get(
            this.route.snapshot.data.isEquipment ? 'equipment' : 'bookables',
        );
    }

    public select(element: Bookables_bookables_items): void {
        this.bookableClick.emit(element);
    }

    /**
     * place holder todo: remove
     * @param bookable
     */
    public createApplication(bookable: UsageBookables_bookables_items): void {}

    public isFullyBooked(bookable: UsageBookables_bookables_items): boolean {
        return (
            bookable.simultaneousBookingMaximum !== -1 &&
            bookable.sharedBookings.length >= bookable.simultaneousBookingMaximum
        );
    }

    public isAlreadyPending(bookable: UsageBookables_bookables_items): boolean {
        return true; //this.pendingApplications.some(applicaton => bookable.id === applicaton.bookable?.id);
    }
}
