import {Injectable} from '@angular/core';
import {
    Bookable,
    Bookables,
    BookingInput,
    BookingPartialInput,
    BookingSortingField,
    BookingStatus,
    BookingsVariables,
    BookingType,
    CreateBooking,
    JoinType,
    LogicalOperator,
    SortingOrder,
    UsageBookables,
} from '../../../shared/generated-types';
import {Observable} from 'rxjs';
import {formatIsoDateTime} from '@ecodev/natural';
import {BookableTagService} from '../../bookableTags/services/bookableTag.service';
import {BookingForVanillaService} from '../../../../vanilla/booking-for-vanilla.service';

@Injectable({
    providedIn: 'root',
})
export class BookingService extends BookingForVanillaService {
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
}
