import {Injectable, inject} from '@angular/core';
import {
    bookingQuery,
    bookingsWithOwnerBalanceQuery,
    createBooking,
    deleteBookings,
    updateBooking,
} from './booking.queries';
import {
    Booking,
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
import {Observable, of} from 'rxjs';
import {BookingService} from './booking.service';

@Injectable({
    providedIn: 'root',
})
export class BookingWithOwnerService extends NaturalAbstractModelService<
    Booking['booking'],
    BookingVariables,
    BookingsWithOwnerBalance['bookings'],
    BookingsWithOwnerBalanceVariables,
    never,
    never,
    UpdateBooking['updateBooking'],
    UpdateBookingVariables,
    DeleteBookings,
    DeleteBookingsVariables
> {
    private readonly bookingService = inject(BookingService);

    public constructor() {
        super('booking', bookingQuery, bookingsWithOwnerBalanceQuery, createBooking, updateBooking, deleteBookings);
    }

    public override getPartialVariablesForAll(): Observable<Partial<BookingsVariables>> {
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

    public terminateBooking(id: string, comment = ''): Observable<unknown> {
        // forward to standard service to avoid duplicating code or a risky refactoring of service hierarchy
        return this.bookingService.terminateBooking(id, comment);
    }
}
