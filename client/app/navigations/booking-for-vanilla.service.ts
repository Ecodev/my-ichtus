import {Injectable} from '@angular/core';
import {Validators} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {
    formatIsoDateTime,
    FormValidators,
    NaturalAbstractModelService,
    NaturalQueryVariablesManager,
    type WithId,
} from '@ecodev/natural';
import {
    type BookableFilterGroupCondition,
    BookingQuery,
    BookingInput,
    type BookingPartialInput,
    BookingsQuery,
    BookingSortingField,
    BookingStatus,
    BookingsQueryVariables,
    BookingType,
    BookingQueryVariables,
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
} from '../shared/generated-types';
import {
    bookingQuery,
    bookingsQuery,
    createBooking,
    deleteBookings,
    terminateBookingMutation,
    updateBooking,
} from '../admin/bookings/services/booking.queries';
import type {Apollo} from 'apollo-angular';
import {clone, div, mergeBookings, stopWaiting} from './general/home';
import {loadBottoms} from './page/bottom';
import {Cahier} from './cahier/methods';
import {
    actualizeFinishedBookingListForDay,
    createBookingsTable,
    createNoBookingMessage,
    loadActualBookings,
} from './cahier/cahier';
import {actualizePopBookableHistory} from './equipment/pop-bookable-history';
import {actualizeStats} from './page/pop-stats';
import {actualizePopBooking} from './cahier/pop-booking';
import {newTab} from './general/screen';
import {ableToSkipAnimation} from './page/top';
import type {ActualizePopBooking, Booking as BookingNav, PopBookingWhich} from './types';

export function getDefaultForServer(): BookingInput {
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

export function getFormValidators(): FormValidators {
    return {
        owner: [Validators.required],
        participantCount: [Validators.min(1)],
    };
}

export function getPartialVariablesForAll(): Observable<Partial<BookingsQueryVariables>> {
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

export function terminateBooking(apollo: Apollo, id: string, comment: string): Observable<unknown> {
    const observable = apollo.mutate<TerminateBooking, TerminateBookingVariables>({
        mutation: terminateBookingMutation,
        variables: {
            id: id,
            comment: comment,
        },
    });

    observable.subscribe(() => {
        apollo.client.reFetchObservableQueries();
    });

    return observable;
}

@Injectable({
    providedIn: 'root',
})
export class BookingForVanillaService extends NaturalAbstractModelService<
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
    public constructor() {
        super('booking', bookingQuery, bookingsQuery, createBooking, updateBooking, deleteBookings);
    }

    public override getDefaultForServer(): BookingInput {
        return getDefaultForServer();
    }

    public override getFormValidators(): FormValidators {
        return getFormValidators();
    }

    private internalTerminateBooking(id: string, comment = ''): Observable<unknown> {
        return terminateBooking(this.apollo, id, comment);
    }

    public override getPartialVariablesForAll(): Observable<Partial<BookingsQueryVariables>> {
        return getPartialVariablesForAll();
    }

    public getBookableLastBooking(bookableId: string): void {
        const filter: BookingsQueryVariables = {
            filter: {
                groups: [
                    {
                        joins: {
                            bookable: {
                                conditions: [
                                    {
                                        id: {
                                            like: {
                                                value: bookableId,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
            pagination: {
                pageSize: 1,
                pageIndex: 0,
            },
            sorting: [
                {
                    field: BookingSortingField.startDate,
                    order: SortingOrder.DESC, // important
                },
            ],
        };

        const variables = new NaturalQueryVariablesManager<BookingsQueryVariables>();
        variables.set('variables', filter);

        this.getAll(variables).subscribe(bookings => {
            //  console.log("getBookableLastBooking(): ", bookings);
            Cahier.actualizeAvailability(bookableId, clone(bookings.items));
        });
    }

    // 1.3
    public checksBookablesAvailabilityBeforeConfirming(_bookables: {id: string | 0}[]): void {
        const d = new Date(Cahier.bookingStartDate.getTime() - 10 * 60 * 1000); // subtract 1 minute $$

        const filter: BookingsQueryVariables = {
            filter: {
                groups: [
                    {
                        groupLogic: LogicalOperator.AND,
                        conditionsLogic: LogicalOperator.OR,
                        joins: {
                            bookable: {
                                conditions: [],
                            },
                        },
                    },
                    {
                        conditionsLogic: LogicalOperator.OR,
                        conditions: [
                            {
                                endDate: {
                                    greater: {
                                        value: d.toISOString(),
                                    },
                                },
                            },
                            {
                                endDate: {
                                    null: {
                                        not: false,
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            pagination: {
                pageSize: 20,
                pageIndex: 0,
            },
        };

        for (const bookable of _bookables) {
            if (bookable.id != 0) {
                // Matériel personnel
                const condition: BookableFilterGroupCondition = {
                    id: {
                        equal: {
                            value: bookable.id,
                        },
                    },
                };
                filter.filter!.groups![0].joins!.bookable!.conditions!.push(condition);
            }
        }

        if (filter.filter!.groups![0].joins!.bookable!.conditions!.length == 0) {
            // means only "Matériel personnel"
            Cahier.actualizeConfirmKnowingBookablesAvailability([]);
            return;
        }

        const variables = new NaturalQueryVariablesManager<BookingsQueryVariables>();
        variables.set('variables', filter);

        this.getAll(variables).subscribe(result => {
            //console.log("checksBookablesAvailabilityBeforeConfirming(): ", result);
            Cahier.actualizeConfirmKnowingBookablesAvailability(clone(result.items));
        });
    }

    // getActualBookingList()
    public getActualBookingList(): void {
        //console.log("GET ACTUAL BOOKING LIST");

        const filter: BookingsQueryVariables = {
            filter: {
                groups: [
                    {
                        groupLogic: LogicalOperator.AND,

                        conditions: [
                            {
                                status: {
                                    equal: {
                                        value: BookingStatus.Booked,
                                    },
                                },
                                endDate: {
                                    null: {
                                        not: false,
                                    },
                                },
                                bookable: {
                                    empty: {
                                        not: true,
                                    },
                                },
                            },
                        ],
                        joins: {
                            bookable: {
                                type: JoinType.leftJoin,
                                conditions: [
                                    {
                                        bookingType: {
                                            equal: {
                                                value: BookingType.SelfApproved,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    {
                        groupLogic: LogicalOperator.OR,

                        conditions: [
                            {
                                status: {
                                    equal: {
                                        value: BookingStatus.Booked,
                                    },
                                },
                                endDate: {
                                    null: {
                                        not: false,
                                    },
                                },
                                bookable: {
                                    empty: {
                                        not: false,
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            pagination: {
                pageSize: 500,
                pageIndex: 0,
            },
            sorting: [
                {
                    field: BookingSortingField.startDate,
                    order: SortingOrder.DESC,
                },
            ],
        };

        const variables = new NaturalQueryVariablesManager<BookingsQueryVariables>();
        variables.set('variables', filter);

        this.getAll(variables).subscribe(result => {
            // force = true
            loadBottoms();
            loadActualBookings(mergeBookings(clone(result.items)));
        });
    }

    // getFinishedBookingListForDay()
    public getFinishedBookingListForDay(d: Date, title: string): void {
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
        const filter: BookingsQueryVariables = {
            filter: {
                groups: [
                    {
                        groupLogic: LogicalOperator.AND,

                        conditions: [
                            {
                                status: {
                                    equal: {
                                        value: BookingStatus.Booked,
                                    },
                                },
                                endDate: {
                                    null: {
                                        not: true,
                                    },
                                },
                                startDate: {
                                    between: {
                                        from: start.toISOString(),
                                        to: end.toISOString(),
                                    },
                                },
                                bookable: {
                                    empty: {
                                        not: true,
                                    },
                                },
                            },
                        ],
                        joins: {
                            bookable: {
                                type: JoinType.leftJoin,
                                conditions: [
                                    {
                                        bookingType: {
                                            equal: {
                                                value: BookingType.SelfApproved,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    {
                        groupLogic: LogicalOperator.OR,

                        conditions: [
                            {
                                status: {
                                    equal: {
                                        value: BookingStatus.Booked,
                                    },
                                },
                                endDate: {
                                    null: {
                                        not: true,
                                    },
                                },
                                startDate: {
                                    between: {
                                        from: start.toISOString(),
                                        to: end.toISOString(),
                                    },
                                },
                                bookable: {
                                    empty: {
                                        not: false,
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            pagination: {
                pageSize: 500,
                pageIndex: 0,
            },
            sorting: [
                {
                    field: BookingSortingField.startDate,
                    order: SortingOrder.DESC,
                },
                {
                    field: BookingSortingField.endDate,
                    order: SortingOrder.DESC, // important, last booking always has the end comment
                },
            ],
        };

        const variables = new NaturalQueryVariablesManager<BookingsQueryVariables>();
        variables.set('variables', filter);

        this.getAll(variables).subscribe(result => {
            // force = true);
            //console.log("getFinishedBookingListForDay(): ", result);
            const transformedBoookings = mergeBookings(clone(result.items));
            if (result.length == 0) {
                createNoBookingMessage(d);
            } else {
                const table = createBookingsTable(d, title + ' (' + transformedBoookings.length + ')');
                Cahier.finishedBookings.push(transformedBoookings); //important
                actualizeFinishedBookingListForDay(transformedBoookings, table);
            }
        });
    }

    // getBookableHistory()
    public getBookableHistory(bookableId: string, elem: HTMLElement, lastDate: Date, Size = 10): void {
        //console.log("getbookableHistory", bookableId, "lastDate:", lastDate, "Size",Size);

        const filter: BookingsQueryVariables = {
            filter: {
                groups: [
                    {
                        joins: {
                            bookable: {
                                conditions: [
                                    {
                                        id: {
                                            like: {
                                                value: bookableId,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    {
                        conditions: [
                            {
                                startDate: {
                                    less: {
                                        value: lastDate.toISOString(),
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            pagination: {
                pageSize: Size,
                pageIndex: 0,
            },
            sorting: [
                {
                    field: BookingSortingField.startDate,
                    order: SortingOrder.DESC,
                },
            ],
        };

        const variables = new NaturalQueryVariablesManager<BookingsQueryVariables>();
        variables.set('variables', filter);

        this.getAll(variables).subscribe(first => {
            //console.log("getBookableHistory(): ", first);

            const bookings = first.items;

            if (first.items.length == 0) {
                if (elem.getElementsByClassName('Buttons').length == 1) {
                    elem.getElementsByClassName('Buttons')[0].parentElement!.removeChild(
                        elem.getElementsByClassName('Buttons')[0],
                    );
                    elem.getElementsByTagName('br')[0].parentElement!.removeChild(elem.getElementsByTagName('br')[0]);
                    const t = div(elem.getElementsByClassName('PopUpBookableHistoryContainerScroll')[0]);
                    t.innerHTML = 'Toutes les sorties ont été chargées ! <br/>';
                    t.style.textAlign = 'center';
                }
            } else {
                let end = new Date(bookings[bookings.length - 1].startDate);
                const start = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 0, 0, 0, 1);
                end = new Date(
                    end.getFullYear(),
                    end.getMonth(),
                    end.getDate(),
                    end.getHours(),
                    end.getMinutes(),
                    end.getSeconds() - 1,
                    0,
                );

                const filter: BookingsQueryVariables = {
                    filter: {
                        groups: [
                            {
                                joins: {
                                    bookable: {
                                        conditions: [
                                            {
                                                id: {
                                                    equal: {
                                                        value: bookableId,
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                            {
                                conditions: [
                                    {
                                        startDate: {
                                            between: {
                                                from: start.toISOString(),
                                                to: end.toISOString(),
                                            },
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    pagination: {
                        pageSize: 100,
                        pageIndex: 0,
                    },
                    sorting: [
                        {
                            field: BookingSortingField.startDate,
                            order: SortingOrder.DESC,
                        },
                    ],
                };

                const variables = new NaturalQueryVariablesManager<BookingsQueryVariables>();
                variables.set('variables', filter);

                this.getAll(variables).subscribe(addition => {
                    //console.log("getBookableHistory()_Addition: ", addition);
                    const total = bookings.concat(addition.items);
                    actualizePopBookableHistory(total, elem);
                });
            }
        });
    }

    public getBookingsNbrBetween(
        start: Date,
        end: Date,
        bookableId = '%',
        elem: HTMLElement = document.body,
        writeIfOne = true,
    ): void {
        const filter: BookingsQueryVariables = {
            filter: {
                groups: [
                    {
                        joins: {
                            bookable: {
                                conditions: [
                                    {
                                        id: {
                                            equal: {
                                                value: bookableId,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    {
                        conditions: [
                            {
                                startDate: {
                                    between: {
                                        from: start,
                                        to: end,
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            pagination: {
                pageSize: 0,
                pageIndex: 0,
            },
        };

        const variables = new NaturalQueryVariablesManager<BookingsQueryVariables>();
        variables.set('variables', filter);

        this.getAll(variables).subscribe(result => {
            //console.log("getBookingsNbrBetween(): ", result.length + " sorties", result);
            if (result.length != 1 || writeIfOne) {
                elem.innerHTML += result.length;
                elem.parentElement!.style.opacity = '1';
            }
        });
    }

    // getMonthlyBookingsNbr for divBottoms
    public getMonthlyBookingsNbr(start: Date, end: Date): void {
        end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 99);

        const filter: BookingsQueryVariables = {
            filter: {
                groups: [
                    {
                        groupLogic: LogicalOperator.AND,
                        conditions: [
                            {
                                startDate: {
                                    between: {
                                        from: start,
                                        to: end,
                                    },
                                    group: {},
                                },
                            },
                            {
                                status: {
                                    equal: {
                                        value: BookingStatus.Booked,
                                    },
                                },
                                bookable: {
                                    empty: {},
                                },
                            },
                        ],
                    },
                    {
                        groupLogic: LogicalOperator.OR,
                        conditions: [
                            {
                                startDate: {
                                    between: {
                                        from: start,
                                        to: end,
                                    },
                                    group: {},
                                },
                            },
                        ],
                        joins: {
                            bookable: {
                                type: JoinType.leftJoin,
                                conditions: [
                                    {
                                        bookingType: {
                                            equal: {
                                                value: BookingType.SelfApproved,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
            pagination: {
                pageSize: 0,
                pageIndex: 0,
            },
        };

        const variables = new NaturalQueryVariablesManager<BookingsQueryVariables>();
        variables.set('variables', filter);

        this.getAll(variables).subscribe(result => {
            // console.log("getMonthlyBookingsNbr(): ", result.length + " sorties", result);

            const all = document.getElementsByClassName('divBottoms');
            for (const elem of all) {
                const child = elem.children[0];
                if (result.length == 0) {
                    child.innerHTML = 'Aucune sortie ce mois';
                } else {
                    child.innerHTML = Cahier.getSingularOrPlural(result.length, ' sortie') + ' ce mois';
                }
            }
        });
    }

    public getStats(start: Date, end: Date, elem: Element): void {
        const f: BookingsQueryVariables = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                startDate: {
                                    between: {
                                        from: start,
                                        to: end,
                                    },
                                },
                            },
                            {
                                bookable: {
                                    empty: {
                                        not: false,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        groupLogic: LogicalOperator.OR,
                        conditions: [
                            {
                                startDate: {
                                    between: {
                                        from: start,
                                        to: end,
                                    },
                                },
                            },
                        ],
                        joins: {
                            bookable: {
                                type: JoinType.leftJoin,
                                conditions: [
                                    {
                                        bookingType: {
                                            equal: {
                                                value: BookingType.SelfApproved,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
            pagination: {
                pageSize: 10000,
                pageIndex: 0,
            },
            sorting: [
                {
                    field: BookingSortingField.startDate,
                    order: SortingOrder.DESC,
                },
            ],
        };

        const variables = new NaturalQueryVariablesManager<BookingsQueryVariables>();
        variables.set('variables', f);

        this.getAll(variables).subscribe(result => {
            //console.log("getStats(): ", result);
            const send = mergeBookings(clone(result.items));
            actualizeStats(start, end, elem, send);
        });
    }

    public getBookingWithBookablesInfos(_booking: BookingNav, which: PopBookingWhich, elem: Element): void {
        const filter: BookingsQueryVariables = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {owner: {equal: {value: _booking.owner!.id}}},
                            {startDate: {equal: {value: _booking.startDate}}},
                        ],
                    },
                ],
            },
            pagination: {
                pageSize: 100,
                pageIndex: 0,
            },
        };

        const variables = new NaturalQueryVariablesManager<BookingsQueryVariables>();
        variables.set('variables', filter);

        this.getAll(variables).subscribe(result => {
            const send = mergeBookings(result.items);
            actualizePopBooking(send[0] as ActualizePopBooking, which, elem); // should only give one booking
        });
    }

    // finishBooking
    public terminateBooking(bookingIds: string[], comments: string[], realTerminate = true): void {
        let c = 0;

        for (let i = 0; i < bookingIds.length; i++) {
            //console.log("terminateBooking", bookingIds[i], comments[i]);
            this.internalTerminateBooking(bookingIds[i], comments[i]).subscribe(() => {
                c++;
                if (c === bookingIds.length) {
                    if (realTerminate) {
                        this.getActualBookingList();
                    } else {
                        console.log('this.terminateBooking() has finished, creating booking now.');
                        this.createBooking();
                    }
                    //console.log("this.terminateBooking done !");
                }
            });
        }
    }

    public terminateCreateAndUpdateBookings(
        idsToFinish: string[],
        commentsToFinish: string[],
        inputsToCreate: BookingInput[],
        idsToUpdate: string[],
        inputsToUpdate: BookingPartialInput[],
    ): void {
        console.log(
            idsToFinish.length +
                ', ' +
                inputsToCreate.length +
                ' and ' +
                idsToUpdate.length +
                ' booking(s) to terminate, create and update respectively.',
        );

        const finished = (): void => this.createAndUpdateBookings(inputsToCreate, idsToUpdate, inputsToUpdate);

        if (idsToFinish.length == 0) finished();

        let c = 0; // counter variable

        // ToFinish
        for (let i = 0; i < idsToFinish.length; i++) {
            //          console.log("Terminate:", idsToFinish[i], commentsToFinish[i]);
            this.internalTerminateBooking(idsToFinish[i], commentsToFinish[i]).subscribe(() => {
                c++;
                if (c == idsToFinish.length) finished();
            });
        }
    }

    private createAndUpdateBookings(
        inputsToCreate: BookingInput[],
        idsToUpdate: string[],
        inputsToUpdate: BookingPartialInput[],
    ): void {
        // filter the input to only keep the allowed fields, append the id to it, and the actual startDate
        const extendInput = function (id: string, input: BookingPartialInput): WithId<BookingPartialInput> {
            const inputFiltered: WithId<BookingPartialInput> = {id: id, startDate: new Date().toISOString()};
            const keys: (keyof BookingPartialInput)[] = [
                'bookable',
                'participantCount',
                'destination',
                'startComment',
                'endComment',
                'startDate',
                'endDate',
            ];
            for (const [key, value] of Object.entries(input)) {
                if (keys.includes(key as any)) inputFiltered[key as keyof BookingPartialInput] = value;
            }
            return inputFiltered;
        };

        const finished = (): void => {
            console.log('Successfully terminated, created and updated the bookings.');
            newTab('divTabCahier');
            ableToSkipAnimation();
            stopWaiting();
        };

        let c = 0; // counter variable
        const total = inputsToCreate.length + inputsToUpdate.length;

        // ToUpdate
        for (let i = 0; i < inputsToUpdate.length; i++) {
            this.updateNow(extendInput(idsToUpdate[i], inputsToUpdate[i])).subscribe(() => {
                c++;
                if (c == total) finished();
            });
        }

        // ToCreate
        for (const item of inputsToCreate) {
            //            console.log("Create:", inputsToCreate[i]);
            this.create(item).subscribe(() => {
                c++;
                if (c == total) finished();
            });
        }
    }

    public getServerInputsForBookingCreating(
        booking = Cahier.bookings[0],
        startDate: string | null = null,
    ): BookingInput[] {
        const bookingInputs: BookingInput[] = [];
        for (let i = 0; i < booking.bookables.length; i++) {
            const input: BookingInput = {
                owner: booking.owner.id,
                participantCount: i == 0 ? booking.participantCount - booking.bookables.length + 1 : 1,
                destination: booking.destination,
                startDate: startDate ? startDate : new Date(),
                startComment: booking.startComment,
                bookable: booking.bookables[i].id != 0 ? booking.bookables[i].id : null,
            };
            bookingInputs.push(input);
        }
        return bookingInputs;
    }

    public createBooking(): void {
        let c = 0;
        const bookingInputs = this.getServerInputsForBookingCreating(Cahier.bookings[0]);
        for (const input of bookingInputs) {
            this.create(input).subscribe(() => {
                c++;
                if (c == bookingInputs.length) {
                    newTab('divTabCahier');
                    ableToSkipAnimation();
                    stopWaiting();
                }
            });
        }
    }
}
