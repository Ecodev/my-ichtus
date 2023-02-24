import {Component, EventEmitter, Injector, Input, Output} from '@angular/core';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {UsageBookableService} from '../services/usage-bookable.service';
import {NaturalAbstractList, NaturalSearchSelections} from '@ecodev/natural';
import {
    BookingPartialInput,
    Bookings_bookings_items,
    BookingStatus,
    CurrentUserForProfile_viewer,
    UsageBookables_bookables_items,
} from '../../../shared/generated-types';
import {BookingService} from '../../bookings/services/booking.service';
import {takeUntil} from 'rxjs/operators';
import {UserService} from '../../users/services/user.service';
import {ActivatedRoute} from '@angular/router';

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
    public pendingApplications: Bookings_bookings_items[] = [];
    public UsageBookableService = UsageBookableService;

    public constructor(
        usageBookableService: UsageBookableService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
        private readonly bookingService: BookingService,
        private readonly userService: UserService,
    ) {
        super(usageBookableService, injector);

        if (this.route.snapshot.data.isAdmin) {
            this.naturalSearchFacets = naturalSearchFacetsService.get(
                this.route.snapshot.data.isStorage ? 'storage' : 'bookables',
            );
        }
    }

    public override ngOnInit(): void {
        super.ngOnInit();

        this.userService
            .getPendingApplications(this.route.snapshot.data.viewer.model)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(result => {
                this.pendingApplications = result.items;
            });
    }

    /**
     * Create a bookable application attributed to the owner specified in route.data.futureOwner.
     */
    public createApplication(
        futureOwner: CurrentUserForProfile_viewer,
        bookable: UsageBookables_bookables_items,
    ): void {
        if (futureOwner) {
            const booking: BookingPartialInput = {status: BookingStatus.application};
            this.bookingService.createWithBookable(bookable, futureOwner, booking).subscribe();
        }
    }
}
