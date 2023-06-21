import {Component, EventEmitter, Injector, Input, OnInit, Output} from '@angular/core';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {UsageBookableService} from '../services/usage-bookable.service';
import {NaturalSearchSelections} from '@ecodev/natural';
import {UsageBookables} from '../../../shared/generated-types';
import {BookingService} from '../../bookings/services/booking.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {UserService} from '../../users/services/user.service';
import {ParentComponent} from './parent.component';
import {of} from 'rxjs';

@Component({
    selector: 'app-usage-bookables',
    templateUrl: './bookables.component.html',
    styleUrls: ['./bookables.component.scss'],
})
export class UsageBookablesComponent extends ParentComponent<UsageBookableService> implements OnInit {
    @Output() public readonly bookableClick = new EventEmitter<UsageBookables['bookables']['items'][0]>();

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
                this.route.snapshot.data.facetsKey ?? 'bookables',
            );
        }
    }

    public override ngOnInit(): void {
        super.ngOnInit();

        if (this.route.snapshot.data.persistSearchUsageBookable === false) {
            this.persistSearch = false;
        }

        this.futureOwner$
            .pipe(
                takeUntil(this.ngUnsubscribe),
                switchMap(futureOwner =>
                    futureOwner ? this.userService.getPendingApplications(futureOwner) : of({items: []}),
                ),
            )
            .subscribe(result => (this.pendingApplications = result.items));
    }
}
