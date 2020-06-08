import {Injectable} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {
    bookingQuery,
    bookingsWithOwnerBalanceQuery,
    createBooking,
    deleteBookings,
    updateBooking,
} from './booking.queries';
import {
    Booking,
    Bookings,
    BookingsVariables,
    BookingVariables,
    DeleteBookings,
    JoinType,
    UpdateBooking,
    UpdateBookingVariables,
} from '../../../shared/generated-types';
import {NaturalAbstractModelService} from '@ecodev/natural';

@Injectable({
    providedIn: 'root',
})
export class BookingWithOwnerService extends NaturalAbstractModelService<
    Booking['booking'],
    BookingVariables,
    Bookings['bookings'],
    BookingsVariables,
    any,
    any,
    UpdateBooking['updateBooking'],
    UpdateBookingVariables,
    DeleteBookings
> {
    constructor(apollo: Apollo) {
        super(
            apollo,
            'booking',
            bookingQuery,
            bookingsWithOwnerBalanceQuery,
            createBooking,
            updateBooking,
            deleteBookings,
        );
    }

    getContextForAll(): Partial<BookingsVariables> {
        return {
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
        };
    }
}
