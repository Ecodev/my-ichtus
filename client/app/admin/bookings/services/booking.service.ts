import {Apollo} from 'apollo-angular';
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
import {forkJoin, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {BookingResolve} from '../booking';
import {
    formatIsoDateTime,
    FormValidators,
    NaturalAbstractModelService,
    NaturalEnumService,
    NaturalDebounceService,
} from '@ecodev/natural';
import {BookableTagService} from '../../bookableTags/services/bookableTag.service';

@Injectable({
    providedIn: 'root',
})
export class BookingService extends NaturalAbstractModelService<
    Booking['booking'],
    BookingVariables,
    Bookings['bookings'],
    BookingsVariables,
    any,
    any,
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

    public static readonly storageApplication: BookingsVariables = {
        filter: {
            groups: [
                {
                    conditions: [{status: {equal: {value: BookingStatus.application}}}],
                    joins: {
                        bookable: {
                            conditions: [
                                {
                                    bookableTags: {have: {values: [BookableTagService.STORAGE]}},
                                    bookingType: {equal: {value: BookingType.application}},
                                },
                            ],
                        },
                    },
                },
            ],
        },
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

    public constructor(
        apollo: Apollo,
        naturalDebounceService: NaturalDebounceService,
        private readonly enumService: NaturalEnumService,
    ) {
        super(
            apollo,
            naturalDebounceService,
            'booking',
            bookingQuery,
            bookingsQuery,
            createBooking,
            updateBooking,
            deleteBookings,
        );
    }

    protected override getDefaultForServer(): BookingInput {
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

    public override resolve(id: string): Observable<BookingResolve> {
        const observables = [super.resolve(id), this.enumService.get('BookingStatus')];

        return forkJoin(observables).pipe(
            map((data: any) => {
                return {
                    model: data[0].model,
                    status: data[1],
                };
            }),
        );
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
        if (!booking.startDate) {
            booking.startDate = formatIsoDateTime(new Date());
        }

        if (!booking.status) {
            booking.status = BookingStatus.application;
        }

        booking.owner = owner ? owner.id : null;
        booking.bookable = bookable ? bookable.id : null;

        return this.create(booking);
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
