import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
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
    BookingsWithOwnerBalance,
    BookingsWithOwnerBalanceVariables,
    BookingVariables,
    DeleteBookings,
    DeleteBookingsVariables,
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
    BookingsWithOwnerBalance['bookings'],
    BookingsWithOwnerBalanceVariables,
    any,
    any,
    UpdateBooking['updateBooking'],
    UpdateBookingVariables,
    DeleteBookings,
    DeleteBookingsVariables
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

    public getPartialVariablesForAll(): Partial<BookingsVariables> {
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
