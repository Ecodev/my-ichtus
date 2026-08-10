import {Service} from '@angular/core';
import {pricedBookingsQuery} from './booking.queries';
import {type PricedBookingsQuery, type PricedBookingsQueryVariables} from '../../../shared/generated-types';
import {NaturalAbstractModelService} from '@ecodev/natural';

@Service()
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
