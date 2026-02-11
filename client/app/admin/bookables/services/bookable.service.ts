import {inject, Injectable} from '@angular/core';
import {bookableQuery, bookablesQuery, createBookable, deleteBookables, updateBookable} from './bookable.queries';
import {
    BookableFilterGroupCondition,
    BookableInput,
    BookableQuery,
    BookableQueryVariables,
    BookablesQuery,
    BookablesQueryVariables,
    BookableState,
    BookableStatus,
    BookingsQuery,
    BookingsQueryVariables,
    BookingType,
    CreateBookable,
    CreateBookableVariables,
    CurrentUserForProfileQuery,
    DeleteBookables,
    DeleteBookablesVariables,
    LogicalOperator,
    UpdateBookable,
    UpdateBookableVariables,
    UserQuery,
} from '../../../shared/generated-types';
import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {BookingService} from '../../bookings/services/booking.service';
import {intersectionBy} from 'es-toolkit';
import {
    FormAsyncValidators,
    FormValidators,
    money,
    NaturalAbstractModelService,
    NaturalQueryVariablesManager,
    unique,
} from '@ecodev/natural';
import {BookableTagService} from '../../bookableTags/services/bookableTag.service';

function creditAccountRequiredValidator(formGroup: AbstractControl): ValidationErrors | null {
    if (!formGroup || !(formGroup instanceof FormGroup)) {
        return null;
    }

    const periodicPrice = formGroup.controls.periodicPrice.value;
    const initialPrice = formGroup.controls.initialPrice.value;
    const creditAccount = formGroup.controls.creditAccount.value;
    return (periodicPrice > 0 || initialPrice > 0) && !creditAccount ? {creditAccountRequired: true} : null;
}

@Injectable({
    providedIn: 'root',
})
export class BookableService extends NaturalAbstractModelService<
    BookableQuery['bookable'],
    BookableQueryVariables,
    BookablesQuery['bookables'],
    BookablesQueryVariables,
    CreateBookable['createBookable'],
    CreateBookableVariables,
    UpdateBookable['updateBookable'],
    UpdateBookableVariables,
    DeleteBookables,
    DeleteBookablesVariables
> {
    private readonly bookingService = inject(BookingService);

    public static readonly membershipServices: BookablesQueryVariables = {
        filter: {
            groups: [
                {
                    conditions: [
                        {
                            bookingType: {in: {values: [BookingType.SelfApproved], not: true}},
                            bookableTags: {have: {values: [BookableTagService.SERVICE]}},
                        },
                    ],
                },
                {
                    groupLogic: LogicalOperator.OR,
                    conditions: [
                        {
                            bookingType: {in: {values: [BookingType.Application]}},
                            bookableTags: {
                                have: {
                                    values: [
                                        BookableTagService.STORAGE_REQUEST,
                                        BookableTagService.FORMATION,
                                        BookableTagService.WELCOME,
                                    ],
                                },
                            },
                        },
                    ],
                },
            ],
        },
    };

    public static readonly application: BookablesQueryVariables = {
        filter: {groups: [{conditions: [{bookingType: {in: {values: [BookingType.Application]}}}]}]},
    };

    public constructor() {
        super('bookable', bookableQuery, bookablesQuery, createBookable, updateBookable, deleteBookables);
    }

    public static getFiltersByTagId(tagId: string): BookablesQueryVariables {
        return {filter: {groups: [{conditions: [{bookableTags: {have: {values: [tagId]}}}]}]}};
    }

    public static bookableByTag(
        tagId: string,
        bookingTypes: BookingType[] = [BookingType.AdminAssigned, BookingType.AdminApproved],
        isActive: boolean | null = null,
    ): BookablesQueryVariables {
        const condition: BookableFilterGroupCondition = {
            bookingType: {in: {values: bookingTypes}},
            bookableTags: {have: {values: [tagId]}},
            status: isActive !== null ? {equal: {value: BookableStatus.Active}} : undefined,
        };

        return {
            filter: {
                groups: [
                    {
                        conditions: [condition],
                    },
                ],
            },
        };
    }

    public static formationBookable(tagId?: string): BookablesQueryVariables {
        const conditions: BookableFilterGroupCondition[] = [
            {
                bookingType: {in: {values: [BookingType.AdminApproved]}},
                bookableTags: {have: {values: [BookableTagService.FORMATION]}},
                status: {equal: {value: BookableStatus.Active}},
            },
        ];

        // And !
        if (tagId) {
            conditions.push({
                bookableTags: {have: {values: [tagId]}},
            });
        }

        return {
            filter: {
                groups: [
                    {
                        conditions: conditions,
                    },
                ],
            },
        };
    }

    public static isLicenseGranted(
        bookable: BookableQuery['bookable'],
        user: UserQuery['user'] | NonNullable<CurrentUserForProfileQuery['viewer']>,
    ): boolean {
        if (!bookable || !user) {
            return false;
        }

        const matching = intersectionBy(bookable.licenses, user.licenses, l => l.id);

        return matching.length === bookable.licenses.length;
    }

    public override getDefaultForServer(): BookableInput {
        return {
            name: '',
            code: null,
            description: '',
            initialPrice: '0',
            periodicPrice: '0',
            purchasePrice: null,
            simultaneousBookingMaximum: 1,
            waitingListLength: 0,
            bookingType: BookingType.SelfApproved,
            remarks: '',
            status: BookableStatus.New,
            state: BookableState.Good,
            verificationDate: null,
            image: null,
            creditAccount: null,
            owner: null,
        };
    }

    public override getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
            code: [Validators.maxLength(10)],
            initialPrice: [money, Validators.required],
            periodicPrice: [money, Validators.required],
            purchasePrice: [money, Validators.min(0)],
            simultaneousBookingMaximum: [Validators.required, Validators.min(-1)],
            waitingListLength: [Validators.required, Validators.min(0)],
        };
    }

    public override getFormAsyncValidators(model: BookableQuery['bookable']): FormAsyncValidators {
        return {
            code: [unique('code', model.id, this)],
        };
    }

    public override getFormGroupValidators(): ValidatorFn[] {
        return [creditAccountRequiredValidator];
    }

    public getMandatoryBookables(): Observable<BookablesQuery['bookables']> {
        const mandatoryBookablesFilter: BookablesQueryVariables = {
            filter: {groups: [{conditions: [{bookingType: {in: {values: [BookingType.Mandatory]}}}]}]},
        };

        const qvm = new NaturalQueryVariablesManager<BookablesQueryVariables>();
        qvm.set('variables', mandatoryBookablesFilter);
        return this.getAll(qvm); // getAll because mandatory bookables should not change
    }

    public getAvailability(
        bookable: BookableQuery['bookable'],
    ): Observable<{isAvailable: boolean; result: BookingsQuery['bookings']}> {
        // Variable for pending bookings related to given bookable
        const variables: BookingsQueryVariables = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                bookable: {have: {values: [bookable.id]}},
                                endDate: {null: {}},
                            },
                        ],
                    },
                ],
            },
        };

        const qvm = new NaturalQueryVariablesManager<BookingsQueryVariables>();
        qvm.set('variables', variables);

        return this.bookingService.getAll(qvm).pipe(
            map(result => {
                const isAvailable =
                    bookable.status === BookableStatus.Active &&
                    (bookable.simultaneousBookingMaximum < 0 || bookable.simultaneousBookingMaximum > result.length);

                return {
                    isAvailable: isAvailable,
                    result: result,
                };
            }),
        );
    }

    public resolveByCode(code: string): Observable<BookablesQuery['bookables']['items'][0] | null> {
        if (code) {
            const qvm = new NaturalQueryVariablesManager<BookablesQueryVariables>();
            const variables: BookablesQueryVariables = {
                filter: {groups: [{conditions: [{code: {equal: {value: code}}}]}]},
            };
            qvm.set('variables', variables);

            return this.getAll(qvm).pipe(
                map(result => {
                    return result?.items.length ? result.items[0] : null;
                }),
            );
        } else {
            return of(null);
        }
    }
}
