import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {pricedBookingsQuery} from './booking.queries';
import {Bookings, BookingsVariables} from '../../../shared/generated-types';
import {NaturalAbstractModelService, NaturalDebounceService} from '@ecodev/natural';

@Injectable({
    providedIn: 'root',
})
export class PricedBookingService extends NaturalAbstractModelService<
    never,
    never,
    Bookings['bookings'],
    BookingsVariables,
    never,
    never,
    never,
    never,
    never,
    never
> {
    public constructor(apollo: Apollo, naturalDebounceService: NaturalDebounceService) {
        super(apollo, naturalDebounceService, 'booking', null, pricedBookingsQuery, null, null, null);
    }
}
