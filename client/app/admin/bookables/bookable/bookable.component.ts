import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NaturalAbstractDetail } from '@ecodev/natural';
import { NaturalAlertService } from '@ecodev/natural';
import { BookableService } from '../services/bookable.service';
import {
    Bookable,
    BookableVariables,
    BookingSortingField,
    BookingsVariables,
    BookingType,
    CreateBookable,
    CreateBookableVariables,
    CreateImage,
    SortingOrder,
    UpdateBookable,
    UpdateBookableVariables,
} from '../../../shared/generated-types';
import { LicenseService } from '../../licenses/services/license.service';
import { BookableTagService } from '../../bookableTags/services/bookableTag.service';
import { ImageService } from '../services/image.service';
import { accountHierarchicConfiguration } from '../../../shared/hierarchic-selector/AccountHierarchicConfiguration';

@Component({
    selector: 'app-bookable',
    templateUrl: './bookable.component.html',
    styleUrls: ['./bookable.component.scss'],
})
export class BookableComponent
    extends NaturalAbstractDetail<Bookable['bookable'],
        BookableVariables,
        CreateBookable['createBookable'],
        CreateBookableVariables,
        UpdateBookable['updateBookable'],
        UpdateBookableVariables,
        any> implements OnInit {

    public accountHierarchicConfig = accountHierarchicConfiguration;
    public bookingsVariables;

    constructor(alertService: NaturalAlertService,
                bookableService: BookableService,
                router: Router,
                route: ActivatedRoute,
                public bookableTagService: BookableTagService,
                public licenseService: LicenseService,
                public imageService: ImageService,
    ) {
        super('bookable', bookableService, alertService, router, route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.bookingsVariables = this.getBookingsVariables();
    }

    public verify() {

        const partialBookable = {id: this.data.model.id, verificationDate: (new Date()).toISOString()};
        this.service.updatePartially(partialBookable).subscribe((bookable) => {
            this.form.patchValue(bookable);
        });

    }

    public showVerified() {
        return this.data.model.bookingType === BookingType.self_approved;
    }

    /**
     * Only non-self-approved are applicable for pricing. This simplify GUI
     */
    public isBookingPriceApplicable() {
        return this.data.model.bookingType !== BookingType.self_approved;
    }

    public newImage(image: CreateImage['createImage']) {

        const imageField = this.form.get('image');
        if (imageField) {
            imageField.setValue(image);
            if (this.data.model.id) {
                this.update();
            }
        }
    }

    public update() {

        // While not saved, automatically update simultaneousBookingMaximum to 1 if navigable (self-approved) or -1 if other.
        if (!this.data.model.id) {
            const bookingType = this.form.get('bookingType');
            const simultaneousBookingMaximum = this.form.get('simultaneousBookingMaximum');
            if (simultaneousBookingMaximum) {
                simultaneousBookingMaximum.setValue(bookingType && bookingType.value === BookingType.self_approved ? 1 : -1);
            }
        }

        super.update();
    }

    public isSelfApproved() {
        return this.data.model.bookingType === BookingType.self_approved;
    }

    public getBookingsVariables(): BookingsVariables {
        return {
            filter: {groups: [{conditions: [{bookable: {have: {values: [this.data.model.id]}}}]}]},
            sorting: [{field: BookingSortingField.startDate, order: SortingOrder.DESC}],
        };
    }

}
