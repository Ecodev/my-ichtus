import {Component, EventEmitter, Injector, Input, Output} from '@angular/core';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {UsageBookableService} from '../services/usage-bookable.service';
import {NaturalAbstractList, NaturalSearchSelections} from '@ecodev/natural';
import {BookingPartialInput, BookingStatus, UsageBookables_bookables_items} from '../../../shared/generated-types';
import {BookingService} from '../../bookings/services/booking.service';

@Component({
    selector: 'app-usage-bookables',
    templateUrl: './bookables.component.html',
    styleUrls: ['./bookables.component.scss'],
})
export class UsageBookablesComponent extends NaturalAbstractList<UsageBookableService> {
    @Output() public readonly bookableClick = new EventEmitter<UsageBookables_bookables_items>();

    @Input()
    public set selections(selections: NaturalSearchSelections) {
        if (!this.searchInitialized) {
            this.naturalSearchSelections = selections;
            this.search(selections);
        }
    }

    public readonly hasUsage = true;
    private searchInitialized = false;

    public constructor(
        usageBookableService: UsageBookableService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
        private readonly bookingService: BookingService,
    ) {
        super(usageBookableService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get(
            this.route.snapshot.data.isStorage ? 'storage' : 'bookables',
        );
    }

    public isFullyBooked(bookable: UsageBookables_bookables_items): boolean {
        return (
            bookable.simultaneousBookingMaximum !== -1 &&
            bookable.sharedBookings.length >= bookable.simultaneousBookingMaximum
        );
    }

    public isAlreadyPending(bookable: UsageBookables_bookables_items): boolean {
        return false; // TODO : show && this.pendingApplications.some(applicaton => bookable.id === applicaton.bookable?.id);
    }

    /**
     *
     */
    public createApplication(bookable: UsageBookables_bookables_items): void {
        console.log(this.route.snapshot.data);
        if (this.route.snapshot.data.futureOwner) {
            const booking: BookingPartialInput = {status: BookingStatus.application};
            this.bookingService.createWithBookable(bookable, this.route.snapshot.data.futureOwner, booking).subscribe();
        }
    }
}
