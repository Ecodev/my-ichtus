import {Injectable} from '@angular/core';
import {pricedBookingsQuery} from './booking.queries';
import {PricedBookings, PricedBookingsVariables} from '../../../shared/generated-types';
import {NaturalAbstractModelService} from '@ecodev/natural';

@Injectable({
    providedIn: 'root',
})
export class PricedBookingService extends NaturalAbstractModelService<
    never,
    never,
    PricedBookings['bookings'],
    PricedBookingsVariables,
    never,
    never,
    never,
    never,
    never,
    never
> {
    public constructor() {
        super('booking', null, pricedBookingsQuery, null, null, null);
    }
}
