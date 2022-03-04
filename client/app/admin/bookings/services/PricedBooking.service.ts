import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {pricedBookingsQuery} from './booking.queries';
import {Bookings, BookingsVariables} from '../../../shared/generated-types';
import {NaturalAbstractModelService} from '@ecodev/natural';

@Injectable({
    providedIn: 'root',
})
export class PricedBookingService extends NaturalAbstractModelService<
    any,
    any,
    Bookings['bookings'],
    BookingsVariables,
    any,
    any,
    any,
    any,
    any,
    any
> {
    public constructor(apollo: Apollo) {
        super(apollo, 'booking', null, pricedBookingsQuery, null, null, null);
    }
}
