import {Component, Injector} from '@angular/core';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {BookingWithOwnerService} from '../services/booking-with-owner.service';
import {AbstractBookings} from './abstract-bookings';
import {Button} from '@ecodev/natural';
import {CopyContactDataButtonService} from '../../../shared/components/copy-contact-data/copy-contact-data-button.service';
import {BookingsWithOwnerContactVariables} from '../../../shared/generated-types';

@Component({
    selector: 'app-bookings-with-owner',
    templateUrl: './bookings.component.html',
    styleUrls: ['./bookings.component.scss'],
})
export class BookingsWithOwnerComponent extends AbstractBookings<BookingWithOwnerService> {
    public override readonly buttons: Button[] = this.copyContactDataButtonService.getButtons(
        this.variablesManager,
        'bookingsWithOwnerContact',
    );

    public constructor(
        bookingWithOwnerService: BookingWithOwnerService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
        private readonly copyContactDataButtonService: CopyContactDataButtonService<BookingsWithOwnerContactVariables>,
    ) {
        super(bookingWithOwnerService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get('bookingsForBookable');
    }
}
