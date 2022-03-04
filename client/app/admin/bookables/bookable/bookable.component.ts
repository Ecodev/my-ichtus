import {Component, Injector, OnInit} from '@angular/core';
import {FileModel, formatIsoDateTime, NaturalAbstractDetail} from '@ecodev/natural';
import {BookableService} from '../services/bookable.service';
import {
    BookingFilterGroupCondition,
    BookingSortingField,
    BookingStatus,
    BookingsVariables,
    BookingType,
    CreateImage,
    CurrentUserForProfile_viewer,
    SortingOrder,
    UserRole,
} from '../../../shared/generated-types';
import {LicenseService} from '../../licenses/services/license.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {BookableTagService} from '../../bookableTags/services/bookableTag.service';
import {ImageService} from '../services/image.service';
import {accountHierarchicConfiguration} from '../../../shared/hierarchic-selector/AccountHierarchicConfiguration';

@Component({
    selector: 'app-bookable',
    templateUrl: './bookable.component.html',
    styleUrls: ['./bookable.component.scss'],
})
export class BookableComponent extends NaturalAbstractDetail<BookableService> implements OnInit {
    public accountHierarchicConfig = accountHierarchicConfiguration;
    public bookingsVariables: BookingsVariables = {};
    public viewer!: CurrentUserForProfile_viewer;

    public constructor(
        bookableService: BookableService,
        injector: Injector,
        public readonly bookableTagService: BookableTagService,
        public readonly licenseService: LicenseService,
        public readonly imageService: ImageService,
        public readonly permissionsService: PermissionsService,
    ) {
        super('bookable', bookableService, injector);
    }

    public ngOnInit(): void {
        super.ngOnInit();

        this.viewer = this.route.snapshot.data.viewer.model;

        if (this.data.model.id) {
            this.bookingsVariables = this.getBookingsVariables();
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

    public newImage(image: FileModel): void {
        const imageField = this.form.get('image');
        if (imageField) {
            imageField.setValue(image);
            if (this.data.model.id) {
                this.update();
            }
        }
    }

    public update(): void {
        // While not saved, automatically update simultaneousBookingMaximum to 1 if navigable (self-approved) or -1 if other.
        if (!this.data.model.id) {
            const bookingType = this.form.get('bookingType');
            const simultaneousBookingMaximum = this.form.get('simultaneousBookingMaximum');
            if (simultaneousBookingMaximum) {
                simultaneousBookingMaximum.setValue(
                    bookingType && bookingType.value === BookingType.self_approved ? 1 : -1,
                );
            }
        }

        super.update();
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
}
