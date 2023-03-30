import {Component, Injector, OnInit} from '@angular/core';
import {formatIsoDateTime, IEnum, NaturalAbstractDetail} from '@ecodev/natural';
import {BookableService} from '../services/bookable.service';
import {
    BookingFilterGroupCondition,
    BookingSortingField,
    BookingStatus,
    BookingsVariables,
    BookingType,
    CreateImage_createImage,
    CurrentUserForProfile_viewer,
    SortingOrder,
    UserRole,
} from '../../../shared/generated-types';
import {LicenseService} from '../../licenses/services/license.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {BookableTagService} from '../../bookableTags/services/bookableTag.service';
import {ImageService} from '../services/image.service';
import {accountHierarchicConfiguration} from '../../../shared/hierarchic-selector/AccountHierarchicConfiguration';
import {Observable, of, takeUntil} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {
    availableColumnsForBookingsWithOwnerOnlyTrainers,
    availableColumnsForBookingsWithOwnerWithoutTrainers,
} from '../../bookings/bookings/abstract-bookings';

@Component({
    selector: 'app-bookable',
    templateUrl: './bookable.component.html',
    styleUrls: ['./bookable.component.scss'],
})
export class BookableComponent extends NaturalAbstractDetail<BookableService> implements OnInit {
    public accountHierarchicConfig = accountHierarchicConfiguration;
    public bookingsVariables: BookingsVariables = {};
    public viewer!: CurrentUserForProfile_viewer;
    public readonly availableColumnsForBookingsWithOwnerWithoutTrainers =
        availableColumnsForBookingsWithOwnerWithoutTrainers;
    public readonly availableColumnsForBookingsWithOwnerOnlyTrainers = availableColumnsForBookingsWithOwnerOnlyTrainers;
    public constructor(
        bookableService: BookableService,
        injector: Injector,
        public readonly bookableTagService: BookableTagService,
        public readonly licenseService: LicenseService,
        private readonly imageService: ImageService,
        public readonly permissionsService: PermissionsService,
    ) {
        super('bookable', bookableService, injector);
    }

    public override ngOnInit(): void {
        super.ngOnInit();

        // While not saved, automatically update simultaneousBookingMaximum to 1 if navigable (self-approved) or -1 if other.
        if (!this.data.model.id) {
            const bookingType = this.form.controls.bookingType;
            const simultaneousBookingMaximum = this.form.controls.simultaneousBookingMaximum;
            bookingType.valueChanges
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(value => simultaneousBookingMaximum.setValue(value === BookingType.self_approved ? 1 : -1));
        }

        this.viewer = this.route.snapshot.data.viewer.model;

        if (this.data.model.id) {
            this.bookingsVariables = this.getBookingsVariables();
        }

        if (this.viewer.role === UserRole.formation_responsible) {
            this.form.controls.bookingType.setValue(BookingType.admin_approved);
        }
    }

    public verify(): void {
        const partialBookable = {id: this.data.model.id, verificationDate: formatIsoDateTime(new Date())};
        this.service.updatePartially(partialBookable).subscribe(bookable => {
            this.form.patchValue(bookable);
        });
    }

    public showVerified(): boolean {
        return this.data.model.bookingType === BookingType.self_approved;
    }

    /**
     * Only non-self-approved are applicable for pricing. This simplify GUI
     */
    public isBookingPriceApplicable(): boolean {
        return this.data.model.bookingType !== BookingType.self_approved;
    }

    public createImageAndLink(file: File): Observable<CreateImage_createImage> {
        return this.imageService.create({file}).pipe(
            switchMap(image => {
                const id = this.data.model.id;
                return id ? this.service.updatePartially({id, image}).pipe(map(() => image)) : of(image);
            }),
        );
    }

    public isSelfApproved(): boolean {
        return this.data.model.bookingType === BookingType.self_approved;
    }

    public getBookingsVariables(): BookingsVariables {
        const conditions: BookingFilterGroupCondition[] = [
            {
                bookable: {have: {values: [this.data.model.id]}},
            },
            {
                status: {in: {values: [BookingStatus.application], not: true}},
            },
        ];

        // Hide terminated bookings for courses/services (cancellation by the user)
        // but still show them for equipment rental
        if (!this.isSelfApproved()) {
            conditions.push({
                endDate: {null: {}},
            });
        }

        return {
            filter: {
                groups: [
                    {
                        conditions: conditions,
                    },
                ],
            },
            sorting: [{field: BookingSortingField.startDate, order: SortingOrder.DESC}],
        };
    }

    public isTrainer(): boolean {
        return this.route.snapshot.data.viewer?.model?.role === UserRole.trainer;
    }

    public bookingTypeDisabled(): (item: IEnum) => boolean {
        return item => {
            return this.viewer.role === UserRole.formation_responsible && item.value !== BookingType.admin_approved;
        };
    }
}
