import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractDetail } from '../../shared/components/AbstractDetail';
import { AlertService } from '../../../shared/components/alert/alert.service';
import { BookableService } from '../services/bookable.service';
import {
    BookableQuery,
    BookableQueryVariables,
    BookingType,
    CreateBookableMutation,
    CreateBookableMutationVariables,
    CreateImageMutation,
    UpdateBookableMutation,
    UpdateBookableMutationVariables,
} from '../../../shared/generated-types';
import { LicenseService } from '../../licenses/services/license.service';
import { BookableTagService } from '../../bookableTags/services/bookableTag.service';
import { ImageService } from '../services/image.service';

@Component({
    selector: 'app-bookable',
    templateUrl: './bookable.component.html',
    styleUrls: ['./bookable.component.scss'],
})
export class BookableComponent
    extends AbstractDetail<BookableQuery['bookable'],
        BookableQueryVariables,
        CreateBookableMutation['createBookable'],
        CreateBookableMutationVariables,
        UpdateBookableMutation['updateBookable'],
        UpdateBookableMutationVariables,
        any> implements OnInit {

    constructor(alertService: AlertService,
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

    public newImage(image: CreateImageMutation['createImage']) {

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

}
