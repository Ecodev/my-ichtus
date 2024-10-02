import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {UsageBookableService} from '../services/usage-bookable.service';
import {
    NaturalAvatarComponent,
    NaturalColumnsPickerComponent,
    NaturalFileComponent,
    NaturalFixedButtonComponent,
    NaturalSearchComponent,
    NaturalSearchSelections,
    NaturalTableButtonComponent,
} from '@ecodev/natural';
import {CommonModule, DatePipe} from '@angular/common';
import {UsageBookables} from '../../../shared/generated-types';
import {BookingService} from '../../bookings/services/booking.service';
import {switchMap} from 'rxjs/operators';
import {UserService} from '../../users/services/user.service';
import {ParentComponent} from './parent.component';
import {of} from 'rxjs';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {FlagComponent} from '../../../shared/components/flag/flag.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-usage-bookables',
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
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
        private readonly userService: UserService,
        dialog: MatDialog,
        snackbar: MatSnackBar,
        bookingService: BookingService,
    ) {
        super(usageBookableService, dialog, snackbar, bookingService);

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
                takeUntilDestroyed(this.destroyRef),
                switchMap(futureOwner =>
                    futureOwner ? this.userService.getPendingApplications(futureOwner) : of({items: []}),
                ),
            )
            .subscribe(result => (this.pendingApplications = result.items));
    }
}
