import {Injectable} from '@angular/core';
import {
    bookingQuery,
    bookingsQuery,
    createBooking,
    deleteBookings,
    terminateBooking,
    updateBooking,
} from './booking.queries';
import {
    Bookable,
    Bookables,
    Booking,
    BookingInput,
    BookingPartialInput,
    Bookings,
    BookingSortingField,
    BookingStatus,
    BookingsVariables,
    BookingType,
    BookingVariables,
    CreateBooking,
    CreateBookingVariables,
    DeleteBookings,
    DeleteBookingsVariables,
    JoinType,
    LogicalOperator,
    SortingOrder,
    TerminateBooking,
    TerminateBookingVariables,
    UpdateBooking,
    UpdateBookingVariables,
    UsageBookables,
} from '../../../shared/generated-types';
import {Validators} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {formatIsoDateTime, FormValidators, NaturalAbstractModelService} from '@ecodev/natural';
import {BookableTagService} from '../../bookableTags/services/bookableTag.service';

@Injectable({
    providedIn: 'root',
})
export class BookingService extends NaturalAbstractModelService<
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
    /**
     * Filters for bookings with endDate with self-approved bookable or no bookable linked
     */
    public static readonly runningSelfApprovedQV: BookingsVariables = {
        filter: {
            groups: [
                {
                    conditions: [{endDate: {null: {}}}],
                    joins: {
                        bookable: {
                            type: JoinType.leftJoin,
                            conditions: [{bookingType: {equal: {value: BookingType.self_approved}}}],
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

    public static readonly selfApprovedQV: BookingsVariables = {
        filter: {
            groups: [
                {
                    joins: {
                        bookable: {
                            type: JoinType.leftJoin,
                            conditions: [{bookingType: {equal: {value: BookingType.self_approved}}}],
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

    public static readonly servicesApplication: BookingsVariables = {
        filter: {
            groups: [
                {
                    conditions: [{status: {equal: {value: BookingStatus.application}}}],
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

    public static applicationByTag(bookableTagId: string): BookingsVariables {
        return {
            filter: {
                groups: [
                    {
                        conditions: [{status: {equal: {value: BookingStatus.application}}}],
                        joins: {
                            bookable: {
                                conditions: [
                                    {
                                        bookableTags: {have: {values: [bookableTagId]}},
                                        bookingType: {
                                            in: {values: [BookingType.application, BookingType.admin_approved]},
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
        return {
            status: BookingStatus.booked,
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

    /**
     * Create a booking with given owner and bookable.
     * Accepts optional third parameter with other default fields of booking
     */
    public createWithBookable(
        bookable:
            | null
            | Bookable['bookable']
            | Bookables['bookables']['items'][0]
            | UsageBookables['bookables']['items'][0],
        owner: {id: string},
        booking: BookingPartialInput = {},
    ): Observable<CreateBooking['createBooking']> {
        const finalBooking: BookingInput = {
            ...booking,
            startDate: booking.startDate ? booking.startDate : formatIsoDateTime(new Date()),
            status: booking.status ? booking.status : BookingStatus.application,
            owner: owner ? owner.id : null,
            bookable: bookable ? bookable.id : null,
        };

        return this.create(finalBooking);
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
