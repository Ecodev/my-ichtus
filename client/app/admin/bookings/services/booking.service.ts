import {Injectable} from '@angular/core';
import {
    BookableQuery,
    BookablesQuery,
    BookingInput,
    BookingPartialInput,
    BookingQuery,
    BookingQueryVariables,
    BookingSortingField,
    BookingsQuery,
    BookingsQueryVariables,
    BookingStatus,
    BookingType,
    CreateBooking,
    CreateBookingVariables,
    DeleteBookings,
    DeleteBookingsVariables,
    JoinType,
    LogicalOperator,
    SortingOrder,
    UpdateBooking,
    UpdateBookingVariables,
    UsageBookablesQuery,
} from '../../../shared/generated-types';
import {Observable} from 'rxjs';
import {formatIsoDateTime, FormValidators, NaturalAbstractModelService} from '@ecodev/natural';
import {BookableTagService} from '../../bookableTags/services/bookableTag.service';
import {bookingQuery, bookingsQuery, createBooking, deleteBookings, updateBooking} from './booking.queries';
import {
    getDefaultForServer,
    getFormValidators,
    getPartialVariablesForAll,
    terminateBooking,
} from '../../../navigations/booking-for-vanilla.service';

@Injectable({
    providedIn: 'root',
})
export class BookingService extends NaturalAbstractModelService<
    BookingQuery['booking'],
    BookingQueryVariables,
    BookingsQuery['bookings'],
    BookingsQueryVariables,
    CreateBooking['createBooking'],
    CreateBookingVariables,
    UpdateBooking['updateBooking'],
    UpdateBookingVariables,
    DeleteBookings,
    DeleteBookingsVariables
> {
    /**
     * Filters for bookings with endDate with self-approved bookable or no bookable linked
     */
    public static readonly runningSelfApprovedQV: BookingsQueryVariables = {
        filter: {
            groups: [
                {
                    conditions: [{endDate: {null: {}}}],
                    joins: {
                        bookable: {
                            type: JoinType.leftJoin,
                            conditions: [{bookingType: {equal: {value: BookingType.SelfApproved}}}],
                        },
                    },
                },
                {
                    groupLogic: LogicalOperator.OR,
                    conditions: [
                        {
                            endDate: {null: {}},
                            bookable: {empty: {}},
                        },
                    ],
                },
            ],
        },
        pagination: {
            pageIndex: 0,
            pageSize: 1000,
        },
    };

    public static readonly selfApprovedQV: BookingsQueryVariables = {
        filter: {
            groups: [
                {
                    joins: {
                        bookable: {
                            type: JoinType.leftJoin,
                            conditions: [{bookingType: {equal: {value: BookingType.SelfApproved}}}],
                        },
                    },
                },
                {
                    groupLogic: LogicalOperator.OR,
                    conditions: [{bookable: {empty: {}}}],
                },
            ],
        },
        sorting: [
            {
                field: BookingSortingField.startDate,
                order: SortingOrder.DESC,
            },
        ],
    };

    public static readonly servicesApplication: BookingsQueryVariables = {
        filter: {
            groups: [
                {
                    conditions: [{status: {equal: {value: BookingStatus.Application}}}],
                    joins: {
                        bookable: {
                            conditions: [
                                {
                                    bookableTags: {
                                        have: {
                                            values: [BookableTagService.SERVICE],
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            ],
        },
    };

    public static applicationByTag(bookableTagId: string): BookingsQueryVariables {
        return {
            filter: {
                groups: [
                    {
                        conditions: [{status: {equal: {value: BookingStatus.Application}}}],
                        joins: {
                            bookable: {
                                conditions: [
                                    {
                                        bookableTags: {have: {values: [bookableTagId]}},
                                        bookingType: {
                                            in: {values: [BookingType.Application, BookingType.AdminApproved]},
                                        },
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
        };
    }

    public constructor() {
        super('booking', bookingQuery, bookingsQuery, createBooking, updateBooking, deleteBookings);
    }

    public override getDefaultForServer(): BookingInput {
        return getDefaultForServer();
    }

    public override getFormValidators(): FormValidators {
        return getFormValidators();
    }

    public terminateBooking(id: string, comment = ''): Observable<unknown> {
        return terminateBooking(this.apollo, id, comment);
    }

    public override getPartialVariablesForAll(): Observable<Partial<BookingsQueryVariables>> {
        return getPartialVariablesForAll();
    }

    /**
     * Create a booking with given owner and bookable.
     * Accepts optional third parameter with other default fields of booking
     */
    public createWithBookable(
        bookable:
            | null
            | BookableQuery['bookable']
            | BookablesQuery['bookables']['items'][0]
            | UsageBookablesQuery['bookables']['items'][0],
        owner: {id: string} | null,
        booking: BookingPartialInput = {},
    ): Observable<CreateBooking['createBooking']> {
        const finalBooking: BookingInput = {
            ...booking,
            startDate: booking.startDate ? booking.startDate : formatIsoDateTime(new Date()),
            status: booking.status ? booking.status : BookingStatus.Application,
            owner: owner ? owner.id : null,
            bookable: bookable ? bookable.id : null,
        };

        return this.create(finalBooking);
    }
}
