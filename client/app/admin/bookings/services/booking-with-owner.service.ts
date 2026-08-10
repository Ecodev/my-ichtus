import {Service} from '@angular/core';
import {
    bookingQuery,
    bookingsWithOwnerBalanceQuery,
    createBooking,
    deleteBookings,
    updateBooking,
} from './booking.queries';
import {
    type BookingQuery,
    type BookingQueryVariables,
    type BookingsQueryVariables,
    type BookingsWithOwnerBalanceQuery,
    type BookingsWithOwnerBalanceQueryVariables,
    type DeleteBookings,
    type DeleteBookingsVariables,
    JoinType,
    type UpdateBooking,
    type UpdateBookingVariables,
} from '../../../shared/generated-types';
import {NaturalAbstractModelService} from '@ecodev/natural';
import {type Observable, of} from 'rxjs';

@Service()
export class BookingWithOwnerService extends NaturalAbstractModelService<
    BookingQuery['booking'],
    BookingQueryVariables,
    BookingsWithOwnerBalanceQuery['bookings'],
    BookingsWithOwnerBalanceQueryVariables,
    never,
    never,
    UpdateBooking['updateBooking'],
    UpdateBookingVariables,
    DeleteBookings,
    DeleteBookingsVariables
> {
    public constructor() {
        super('booking', bookingQuery, bookingsWithOwnerBalanceQuery, createBooking, updateBooking, deleteBookings);
    }

    public override getPartialVariablesForAll(): Observable<Partial<BookingsQueryVariables>> {
        return of({
            filter: {
                groups: [
                    {
                        joins: {
                            owner: {
                                type: JoinType.leftJoin,
                                joins: {accounts: {type: JoinType.leftJoin}},
                            },
                        },
                    },
                ],
            },
        });
    }
}
