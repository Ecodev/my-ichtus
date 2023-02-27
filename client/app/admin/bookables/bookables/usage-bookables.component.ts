import {Component, Directive, EventEmitter, Injector, Input, OnInit, Output} from '@angular/core';
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
import {BookableService} from '../services/bookable.service';
import {ExtractTallOne} from '@ecodev/natural/lib/types/types';

@Directive()
export class ParentComponent<T extends UsageBookableService | BookableService> extends NaturalAbstractList<T> {
    public readonly hasUsage: boolean = false;
    public readonly UsageBookableService = UsageBookableService;
    public pendingApplications: Bookings_bookings_items[] = [];

    public constructor(service: T, injector: Injector, private readonly bookingService: BookingService) {
        super(service, injector);
    }

    /**
     * Create a bookable application attributed to the owner specified in route.data.futureOwner.
     */
    public createApplication(futureOwner: CurrentUserForProfile_viewer, bookable: ExtractTallOne<T>): void {
        if (futureOwner) {
            const booking: BookingPartialInput = {status: BookingStatus.application};
            this.bookingService.createWithBookable(bookable, futureOwner, booking).subscribe();
        }
    }
}

@Component({
    selector: 'app-usage-bookables',
    templateUrl: './bookables.component.html',
    styleUrls: ['./bookables.component.scss'],
})
export class UsageBookablesComponent extends ParentComponent<UsageBookableService> implements OnInit {
    @Output() public readonly bookableClick = new EventEmitter<UsageBookables_bookables_items>();

    @Input()
    public set selections(selections: NaturalSearchSelections) {
        if (!this.searchInitialized) {
            this.naturalSearchSelections = selections;
            this.search(selections);
        }
    }

    public override readonly hasUsage = true;
    private searchInitialized = false;

    public constructor(
        usageBookableService: UsageBookableService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
        private readonly userService: UserService,
        bookingService: BookingService,
    ) {
        super(usageBookableService, injector, bookingService);

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
}
