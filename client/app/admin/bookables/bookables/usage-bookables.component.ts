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
export class ParentComponent<T extends UsageBookableService | BookableService>
    extends NaturalAbstractList<T>
    implements OnInit
{
    protected readonly hasUsage: boolean = false;
    public readonly UsageBookableService = UsageBookableService;
    public pendingApplications: Bookings_bookings_items[] = [];

    public constructor(service: T, injector: Injector, private readonly bookingService: BookingService) {
        super(service, injector);
    }

    public override ngOnInit() {
        super.ngOnInit();

        this.availableColumns = [
            {id: 'image', label: 'Image'},
            ...(this.route.snapshot.data.isAdmin ? [{id: 'name', label: 'Nom'}] : [{id: 'readOnlyName', label: 'Nom'}]),
            {id: 'code', label: 'Code'},
            {id: 'description', label: 'Description'},
            {id: 'price', label: 'Prix'},
            {id: 'purchasePrice', label: "Prix d'achat"},
            {id: 'initialPrice', label: 'Prix initial'},
            {id: 'periodicPrice', label: 'Prix périodique'},
            {id: 'updateDate', label: 'Dernière modification'},
            ...(this.hasUsage
                ? [
                      {id: 'usage', label: 'Utilisations'},
                      {id: 'usageNb', label: 'Disponibilité'},
                  ]
                : []),
            {id: 'verificationDate', label: 'Dernière vérification'},
            {id: 'select', label: 'Sélection', checked: false, hidden: true},
            // TODO (sam) write docs (use column with caution, need routing parameters
            {id: 'createApplication', label: 'Demander', checked: false, hidden: true},
        ];
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

    /**
     * Returns true to allow booking if the resource is not already booked or is already booked but not denied for second booking by
     * routing data denyDoubleBooking.
     *
     * This is just ergonomics considerations. API does not deny double booking on specific resources in this case
     */
    public allowBooking(
        futureOwner: CurrentUserForProfile_viewer,
        bookable: UsageBookables_bookables_items,
        pendingApplications: Bookings_bookings_items[],
    ): boolean {
        const alreadyBooked = UsageBookableService.isAlreadyPending(bookable, pendingApplications);
        return futureOwner && (!alreadyBooked || (alreadyBooked && !this.route.snapshot.data.denyDoubleBooking));
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
