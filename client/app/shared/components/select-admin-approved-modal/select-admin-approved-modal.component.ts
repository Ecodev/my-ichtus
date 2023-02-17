import {Component, OnInit} from '@angular/core';
import {BookableService} from '../../../admin/bookables/services/bookable.service';
import {
    BookableSortingField,
    BookablesVariables,
    Bookings_bookings_items,
    BookingType,
    UsageBookables,
    UsageBookables_bookables_items,
} from '../../generated-types';
import {SelectionModel} from '@angular/cdk/collections';
import {NaturalAbstractController, NaturalDataSource, NaturalQueryVariablesManager} from '@ecodev/natural';
import {BookableTagService} from '../../../admin/bookableTags/services/bookableTag.service';
import {map} from 'rxjs/operators';
import {UsageBookableService} from '../../../admin/bookables/services/usage-bookable.service';
import {EMPTY, Observable, switchMap, takeUntil} from 'rxjs';
import {UserService} from '../../../admin/users/services/user.service';
import {ActivatedRoute} from '@angular/router';

export type SelectAdminApprovedModalResult = UsageBookables_bookables_items[];

@Component({
    selector: 'app-select-admin-approved-modal',
    templateUrl: './select-admin-approved-modal.component.html',
    styleUrls: ['./select-admin-approved-modal.component.scss'],
})
export class SelectAdminApprovedModalComponent extends NaturalAbstractController implements OnInit {
    public servicesDataSource!: NaturalDataSource<UsageBookables['bookables']>;
    public storagesDataSource!: NaturalDataSource<UsageBookables['bookables']>;
    public formationsDataSource!: NaturalDataSource<UsageBookables['bookables']>;
    public welcomeDataSource!: NaturalDataSource<UsageBookables['bookables']>;
    public surveyDataSource!: NaturalDataSource<UsageBookables['bookables']>;
    public selection = new SelectionModel<UsageBookables['bookables']['items']>(true, []);
    private pendingApplications: Bookings_bookings_items[] = [];

    public constructor(
        private readonly bookableService: UsageBookableService,
        private readonly userService: UserService,
        private readonly route: ActivatedRoute,
    ) {
        super();
    }

    public ngOnInit(): void {
        console.log('init');
        this.fetch(BookableTagService.STORAGE_REQUEST).subscribe(res => (this.storagesDataSource = res));
        this.fetch(BookableTagService.SERVICE).subscribe(res => (this.servicesDataSource = res));
        this.fetch(BookableTagService.FORMATION).subscribe(res => (this.formationsDataSource = res));
        this.fetch(BookableTagService.WELCOME).subscribe(res => (this.welcomeDataSource = res));
        this.fetch(BookableTagService.SURVEY).subscribe(res => (this.surveyDataSource = res));

        this.route.data.subscribe(data => console.log('data', data));

        this.userService
            .getViewer()
            .pipe(
                takeUntil(this.ngUnsubscribe),
                switchMap(viewer => (viewer ? this.userService.getPendingApplications(viewer) : EMPTY)),
            )
            .subscribe(pendingApplications => (this.pendingApplications = pendingApplications.items));
    }

    public fetch(tag: string): Observable<NaturalDataSource<UsageBookables['bookables']>> {
        let variables;
        if (tag === BookableTagService.FORMATION || tag === BookableTagService.WELCOME) {
            // For new courses and welcome sessions, user will apply by creating a booking on the real admin_approved course bookable
            // Old courses are still using application bookable, so those have to be listed too
            // Only active courses are listed
            variables = BookableService.bookableByTag(tag, [BookingType.admin_approved, BookingType.application], true);
        } else {
            // For other services/storage, user will create a booking on a application bookable
            variables = BookableService.bookableByTag(tag, [BookingType.application], true);
        }
        const qvm = new NaturalQueryVariablesManager<BookablesVariables>();
        qvm.set('variables', variables);
        qvm.set('sorting', {sorting: [{field: BookableSortingField.name}]}); // TODO: IMPLEMENT if needed before deletion

        // Get all because requirable storages should not change
        return this.bookableService.getAll(qvm).pipe(map(result => new NaturalDataSource(result)));
    }

    public isFullyBooked(bookable: UsageBookables_bookables_items): boolean {
        return (
            bookable.simultaneousBookingMaximum !== -1 &&
            bookable.sharedBookings.length >= bookable.simultaneousBookingMaximum
        );
    }

    public isFull(show: boolean, bookable: UsageBookables_bookables_items): boolean {
        return show && this.isFullyBooked(bookable);
    }

    public isAlreadyPending(show: boolean, bookable: UsageBookables_bookables_items): boolean {
        return show && this.pendingApplications.some(applicaton => bookable.id === applicaton.bookable?.id);
    }
}
