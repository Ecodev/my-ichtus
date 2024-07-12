import {Injectable} from '@angular/core';
import {Validators} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {formatIsoDateTime, FormValidators, NaturalAbstractModelService} from '@ecodev/natural';
import {
    Booking,
    BookingInput,
    Bookings,
    BookingStatus,
    BookingsVariables,
    BookingVariables,
    CreateBooking,
    CreateBookingVariables,
    DeleteBookings,
    DeleteBookingsVariables,
    JoinType,
    TerminateBooking,
    TerminateBookingVariables,
    UpdateBooking,
    UpdateBookingVariables,
} from '../app/shared/generated-types';
import {
    bookingQuery,
    bookingsQuery,
    createBooking,
    deleteBookings,
    terminateBooking,
    updateBooking,
} from '../app/admin/bookings/services/booking.queries';

/**
 * **DO NOT MODIFY UNLESS STRICTLY REQUIRED FOR VANILLA**
 *
 * This is a minimal service specialized for Vanilla and any modification,
 * including adding `import` in this file, might break https://navigations.ichtus.club.
 */
@Injectable({
    providedIn: 'root',
})
export class BookingForVanillaService extends NaturalAbstractModelService<
    Booking['booking'],
    BookingVariables,
    Bookings['bookings'],
    BookingsVariables,
    CreateBooking['createBooking'],
    CreateBookingVariables,
    UpdateBooking['updateBooking'],
    UpdateBookingVariables,
    DeleteBookings,
    DeleteBookingsVariables
> {
    public constructor() {
        super('booking', bookingQuery, bookingsQuery, createBooking, updateBooking, deleteBookings);
    }

    public override getDefaultForServer(): BookingInput {
        return {
            status: BookingStatus.Booked,
            owner: null,
            bookable: null,
            destination: '',
            participantCount: 1,
            startComment: '',
            endComment: '',
            estimatedEndDate: '',
            startDate: formatIsoDateTime(new Date()),
            endDate: '',
            remarks: '',
            internalRemarks: '',
        };
    }

    public override getFormValidators(): FormValidators {
        return {
            owner: [Validators.required],
            participantCount: [Validators.min(1)],
        };
    }

    public terminateBooking(id: string, comment = ''): Observable<unknown> {
        const observable = this.apollo.mutate<TerminateBooking, TerminateBookingVariables>({
            mutation: terminateBooking,
            variables: {
                id: id,
                comment: comment,
            },
        });

        observable.subscribe(() => {
            this.apollo.client.reFetchObservableQueries();
        });

        return observable;
    }

    public override getPartialVariablesForAll(): Observable<Partial<BookingsVariables>> {
        return of({
            filter: {
                groups: [
                    {
                        joins: {
                            owner: {
                                type: JoinType.leftJoin,
                            },
                        },
                    },
                ],
            },
        });
    }
}
