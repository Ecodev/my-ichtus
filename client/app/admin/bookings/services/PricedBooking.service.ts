import {Injectable} from '@angular/core';
import {pricedBookingsQuery} from './booking.queries';
import {PricedBookingsQuery, PricedBookingsQueryVariables} from '../../../shared/generated-types';
import {NaturalAbstractModelService} from '@ecodev/natural';

@Injectable({
    providedIn: 'root',
})
export class PricedBookingService extends NaturalAbstractModelService<
    never,
    never,
    PricedBookingsQuery['bookings'],
    PricedBookingsQueryVariables,
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
