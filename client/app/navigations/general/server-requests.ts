import {$, clone, closePopUp, div, getNiceTime, mergeBookings, stopWaiting} from './home';
import {loadBottoms} from '../page/bottom';
import {popLogin} from '../member/login';
import {createSearchEntries} from '../member/user';
import {loadElements} from '../equipment/elements';
import {Cahier} from '../cahier/methods';
import {popAlert} from './pop-alert';
import {actualizePopBookable, popBookable} from '../equipment/pop-bookable';
import {
    actualizeFinishedBookingListForDay,
    createBookingsTable,
    createNoBookingMessage,
    loadActualBookings,
} from '../cahier/cahier';
import {actualizePopBookableHistory} from '../equipment/pop-bookable-history';
import {actualizeStats} from '../page/pop-stats';
import {type ActualizePopBooking, actualizePopBooking, type PopBookingWhich} from '../cahier/pop-booking';
import {newTab} from './screen';
import {ableToSkipAnimation} from '../page/top';
import {NaturalQueryVariablesManager, type WithId} from '@ecodev/natural';
import {BookableForVanillaService} from '../bookable-for-vanilla.service';
import {BookingForVanillaService} from '../booking-for-vanilla.service';
import {UserForVanillaService} from '../user-for-vanilla.service';
import {
    type BookableFilterGroupCondition,
    type Bookables,
    BookableSortingField,
    BookableStatus,
    type BookablesVariables,
    type BookingInput,
    type BookingPartialInput,
    type Bookings,
    BookingSortingField,
    BookingStatus,
    type BookingsVariables,
    BookingType,
    JoinType,
    LogicalOperator,
    SortingOrder,
    type Users,
    UserSortingField,
    UserStatus,
    UsersVariables,
} from '../../shared/generated-types';

// Type alias for convenience
export type User = Users['users']['items'][0];
export type Bookable = Bookables['bookables']['items'][0];
export type Booking = Bookings['bookings']['items'][0];
export type BookableWithExtra = Bookable & {
    used: boolean;
    lastBooking: null | Booking;
    lessThan13Minutes?: boolean;
};
export type BookableWithLastBooking = Bookable & {
    lastBooking: null | Booking;
};

type ServerType = {
    userService: UserForVanillaService;
    bookableService: BookableForVanillaService;
    bookingService: BookingForVanillaService;
};

let server: ServerType;

export function serverInitialize(theServer: ServerType): void {
    server = theServer;
}

export const Requests = {
    login: function (pwd: string): void {
        //console.log("LOGIN");

        server.userService
            .login({
                login: 'bookingonly',
                password: pwd,
            })
            .subscribe(result => {
                closePopUp('last');

                //console.log("result of login :", result);

                if (result != null) {
                    if (result.login === 'bookingonly') {
                        Requests.isConnected();
                    } else {
                        console.error('Mauvais utilisateur connecté... (' + result.login + ')');
                    }
                } else {
                    console.error("Problème d'authentification...");
                }
            });
    },

    // have to log in
    haveToLogin: function (): void {
        if (window.location.hostname === 'navigations.ichtus.club') {
            popLogin();
        } else {
            setTimeout(function () {
                Requests.login('bookingonly');
            }, 2000); // auto mdp, timeout to avoid overloading the server
        }
    },

    // is connected
    isConnected: function (): void {
        console.warn('Connecté à ' + getNiceTime(new Date()));
        Requests.getActualBookingList();
    },

    // actualizeLoginButton
    checkLogin: function (): void {
        server.userService.getViewer().subscribe(function (user) {
            //console.log("user:", user);

            // pas connecté
            if (!user) {
                console.error('Pas connecté');
                Requests.haveToLogin();
            }
            // connecté
            else {
                if (user.login === 'bookingonly') {
                    Requests.isConnected();
                } else {
                    console.error('Mauvais utilisateur connecté... (' + user.name + ')');
                    Requests.haveToLogin();
                }
            }
        });
    },

    // getUsersList FOR user.js
    getUsersList: function (text = ''): void {
        let filter: UsersVariables;
        const texts = [];

        const parts = text.split(' ');
        for (const item of parts) {
            if (item != '') {
                texts.push(item);
            }
        }

        const nbr = texts.length;
        if (nbr == 1) {
            filter = {
                filter: {
                    groups: [
                        {
                            conditionsLogic: LogicalOperator.OR,
                            conditions: [
                                {
                                    firstName: {
                                        like: {
                                            value: texts[0] + '%',
                                        },
                                    },
                                },
                                {
                                    lastName: {
                                        like: {
                                            value: texts[0] + '%',
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            groupLogic: LogicalOperator.AND,
                            conditions: [
                                {
                                    id: {
                                        equal: {
                                            value: '7083', // booking only user
                                            not: true,
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            groupLogic: LogicalOperator.AND,
                            conditions: [
                                {
                                    status: {
                                        // status
                                        equal: {
                                            value: UserStatus.Active,
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            };
        } else if (nbr == 2) {
            filter = {
                filter: {
                    groups: [
                        {
                            conditions: [
                                {
                                    firstName: {
                                        like: {
                                            value: texts[0] + '%',
                                        },
                                    },
                                },
                                {
                                    lastName: {
                                        like: {
                                            value: texts[1] + '%',
                                        },
                                    },
                                },
                                {
                                    id: {
                                        equal: {
                                            value: '7083', // booking only user
                                            not: true,
                                        },
                                    },
                                },
                                {
                                    status: {
                                        // status
                                        equal: {
                                            value: UserStatus.Active,
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            groupLogic: LogicalOperator.OR,
                            conditions: [
                                {
                                    firstName: {
                                        like: {
                                            value: texts[1] + '%',
                                        },
                                    },
                                },
                                {
                                    lastName: {
                                        like: {
                                            value: texts[0] + '%',
                                        },
                                    },
                                },
                                {
                                    id: {
                                        equal: {
                                            value: '7083', // booking only user
                                            not: true,
                                        },
                                    },
                                },
                                {
                                    status: {
                                        // status
                                        equal: {
                                            value: UserStatus.Active,
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            };
        } else {
            filter = {
                filter: {
                    groups: [
                        {
                            conditions: [
                                {
                                    custom: {
                                        search: {
                                            value: text,
                                        },
                                    },
                                },
                                {
                                    id: {
                                        equal: {
                                            value: '7083',
                                            not: true,
                                        },
                                    },
                                },
                                {
                                    status: {
                                        // status
                                        equal: {
                                            value: UserStatus.Active,
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            };
        }

        filter.pagination = {
            pageSize: 5,
            pageIndex: 0,
        };
        filter.sorting = [
            {
                field: UserSortingField.firstName,
                order: SortingOrder.ASC,
            },
            {
                field: UserSortingField.lastName,
                order: SortingOrder.ASC,
            },
        ];

        const variables = new NaturalQueryVariablesManager<UsersVariables>();
        variables.set('variables', filter);

        server.userService.getAll(variables).subscribe(result => {
            //    console.log("getUsersList(): ", result);
            createSearchEntries(result.items);
        });
    },

    getBookablesList: function (elem = $('inputTabCahierEquipmentElementsInputSearch')): void {
        let order: SortingOrder;
        if (
            $('divTabCahierEquipmentElementsSelectIconSort').style.backgroundImage ==
            'url("assets/navigations/icons/sort-desc.png")'
        ) {
            order = SortingOrder.DESC;
        } else {
            order = SortingOrder.ASC;
        }

        const whichFieldSource = $('divTabCahierEquipmentElementsSelectSort').getElementsByTagName('select')[0]
            .value as BookableSortingField | 'lastUse' | 'nbrBookings';
        let whichField: BookableSortingField;
        if (whichFieldSource == 'lastUse') {
            whichField = BookableSortingField.id;
        } else if (whichFieldSource == 'nbrBookings') {
            whichField = BookableSortingField.id;
        } else {
            whichField = whichFieldSource;
        }

        const txt = elem.value;

        let categorie = $('divTabCahierEquipmentElementsSelectCategorie').getElementsByTagName('select')[0].value;
        if (categorie == 'all') {
            categorie = '';
        }
        if (categorie == 'Canoe_Kayak') {
            categorie = 'Kayak';
        }
        if (categorie == 'Voile') {
            categorie = 'Voile lestée';
        }

        const f: BookablesVariables = {
            filter: {
                groups: [
                    {
                        groupLogic: LogicalOperator.AND,
                        conditionsLogic: LogicalOperator.OR,
                        conditions: [
                            {
                                custom: {
                                    // marche pour description
                                    search: {
                                        value: '%' + txt + '%',
                                    },
                                },
                            },
                            {
                                code: {
                                    // marche pour description
                                    like: {
                                        value: '%' + txt + '%',
                                    },
                                },
                            },
                        ],
                    },
                    {
                        //CATEGORIES...
                        groupLogic: LogicalOperator.AND,
                        conditionsLogic: LogicalOperator.OR,
                        joins: {
                            bookableTags: {
                                type: JoinType.leftJoin,
                                conditions: [
                                    {
                                        name: {
                                            like: {
                                                value: '%' + categorie + '%',
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    {
                        groupLogic: LogicalOperator.AND,
                        conditionsLogic: LogicalOperator.AND,
                        conditions: [
                            {
                                bookingType: {
                                    equal: {
                                        value: BookingType.SelfApproved,
                                    },
                                },
                                status: {
                                    // embarcation active
                                    equal: {
                                        value: BookableStatus.Active,
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            sorting: [{field: whichField, order: order}],
            pagination: {
                pageSize: parseInt(
                    $('divTabCahierEquipmentElementsSelectPageSize').getElementsByTagName('select')[0].value,
                ),
                pageIndex: 0,
            },
        };

        if (categorie == 'Kayak') {
            f.filter!.groups![1].joins!.bookableTags!.conditions!.push({
                name: {
                    like: {
                        value: '%' + 'Canoë' + '%',
                    },
                },
            });
        } else if (categorie == 'Voile lestée') {
            f.filter!.groups![1].joins!.bookableTags!.conditions!.push({
                name: {
                    like: {
                        value: '%' + 'voile légère' + '%',
                    },
                },
            });
        }

        const variables = new NaturalQueryVariablesManager<BookablesVariables>();
        variables.set('variables', f);

        server.bookableService.getAll(variables).subscribe(result => {
            if (result.items.length === 0) {
                console.log('NOTHING');
                loadElements([]);
            } else {
                const ids: string[] = [];
                const bookables: BookableWithExtra[] = result.items.map(item => {
                    ids.push(item.id);

                    return {
                        ...clone(item),
                        used: false,
                        lastBooking: null,
                    };
                });

                const filter: BookingsVariables = {
                    filter: {
                        groups: [
                            {
                                conditions: [
                                    {
                                        endDate: {
                                            null: {
                                                not: false,
                                            },
                                        },
                                    },
                                ],
                                joins: {
                                    bookable: {
                                        type: JoinType.leftJoin,
                                        conditions: [
                                            {
                                                id: {
                                                    in: {
                                                        values: ids,
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
                const variables = new NaturalQueryVariablesManager<BookingsVariables>();
                variables.set('variables', filter);

                server.bookingService.getAll(variables).subscribe(result => {
                    const bookings = result.items;

                    for (const booking of bookings) {
                        for (const bookable of bookables) {
                            if (bookable.id === booking.bookable?.id) {
                                bookable.used = true;
                                bookable.lastBooking = {...booking};
                            }
                        }
                    }

                    // Load elements on page
                    loadElements(bookables);
                });
            }
        });
    },

    // getBookableNbrForBookableTag()
    getBookableNbrForBookableTag: function (bookableTag: string, elem: HTMLElement, before = '', after = ''): void {
        if (bookableTag == 'Canoe_Kayak') {
            bookableTag = 'Kayak';
        }
        if (bookableTag == 'Voile') {
            bookableTag = 'Voile lestée';
        }

        const filter: BookablesVariables = {
            filter: {
                groups: [
                    {
                        conditionsLogic: LogicalOperator.OR,
                        joins: {
                            bookableTags: {
                                type: JoinType.leftJoin,
                                conditions: [
                                    {
                                        name: {
                                            like: {
                                                value: '%' + bookableTag + '%',
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
                                status: {equal: {value: BookableStatus.Active}},
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

        if (bookableTag == 'Kayak') {
            filter.filter!.groups![0].joins!.bookableTags!.conditions!.push({
                name: {
                    like: {
                        value: '%' + 'Canoë' + '%',
                    },
                },
            });
        } else if (bookableTag == 'Voile lestée') {
            filter.filter!.groups![0].joins!.bookableTags!.conditions!.push({
                name: {
                    like: {
                        value: '%' + 'voile légère' + '%',
                    },
                },
            });
        }

        const variables = new NaturalQueryVariablesManager<BookablesVariables>();
        variables.set('variables', filter);

        server.bookableService.getAll(variables).subscribe(result => {
            const txt = before + result.length + after;
            elem.innerHTML = txt;
        });
    },

    getBookableByCode: function (elem: HTMLInputElement, nbr = 0): void {
        let t = true;

        let code = elem.value.toUpperCase().trim();

        for (const item of Cahier.bookings[0].bookables) {
            if (item.code.toUpperCase() == code) {
                t = false;
            }
        }

        // accept NE538 although the real code is NE 538
        if (code.startsWith('NE') && !code.includes('NE ')) {
            code = 'NE ' + code.slice(2);
            //  console.log(code);
        } else {
            //    console.log(code.indexOf("NE"), code.indexOf("NE "));
        }

        if (!t) {
            popAlert('Vous avez déjà choisi cette embarcation');
        } else {
            const filter: BookablesVariables = {
                filter: {
                    groups: [
                        {
                            conditions: [
                                {status: {equal: {value: BookableStatus.Active}}},
                                {code: {like: {value: code}}},
                                {
                                    bookingType: {
                                        like: {
                                            value: BookingType.SelfApproved,
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
                pagination: {
                    pageSize: 1,
                    pageIndex: 0,
                },
            };

            const variables = new NaturalQueryVariablesManager<BookablesVariables>();
            variables.set('variables', filter);

            server.bookableService.getAll(variables).subscribe(result => {
                //console.log("getBookableByCode(): ", result);
                if (result.items.length == 1) {
                    popBookable(result.items[0].id, false, nbr, $('divTabCahierEquipmentBookableContainer'));

                    elem.classList.remove('animationShake');
                    elem.nextElementSibling!.classList.remove('animationShake');
                } else {
                    // retrigger animation
                    elem.classList.remove('animationShake');
                    elem.nextElementSibling!.classList.remove('animationShake');

                    elem.classList.add('resetAnimation');
                    elem.nextElementSibling!.classList.add('resetAnimation');

                    setTimeout(function () {
                        elem.classList.remove('resetAnimation');
                        elem.nextElementSibling!.classList.remove('resetAnimation');

                        elem.classList.add('animationShake');
                        elem.nextElementSibling!.classList.add('animationShake');
                    }, 5);
                }
            });
        }
    },

    getBookableInfos: function (nbr: number, bookableId: string, elem: HTMLElement): void {
        const filter: BookablesVariables = {
            filter: {
                groups: [{conditions: [{id: {like: {value: bookableId}}}]}],
            },
            pagination: {
                pageSize: 1,
                pageIndex: 0,
            },
        };

        const variables = new NaturalQueryVariablesManager<BookablesVariables>();
        variables.set('variables', filter);

        server.bookableService.getAll(variables).subscribe(result => {
            //console.log("getBookableInfos(): ", result);
            const filter: BookingsVariables = {
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

            const variables = new NaturalQueryVariablesManager<BookingsVariables>();
            variables.set('variables', filter);

            server.bookingService.getAll(variables).subscribe(bookings => {
                //console.log("getBookableInfos()_getLastBooking: ", bookings);
                const bookable = {...result.items[0]};
                actualizePopBookable(nbr, bookable, bookings, elem);
            });
        });
    },

    getBookableLastBooking: function (bookableId: string): void {
        const filter: BookingsVariables = {
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

        const variables = new NaturalQueryVariablesManager<BookingsVariables>();
        variables.set('variables', filter);

        server.bookingService.getAll(variables).subscribe(bookings => {
            //  console.log("getBookableLastBooking(): ", bookings);
            Cahier.actualizeAvailability(bookableId, clone(bookings.items));
        });
    },

    // 1.3
    checksBookablesAvailabilityBeforeConfirming: function (_bookables: {id: string | 0}[]): void {
        const d = new Date(Cahier.bookingStartDate.getTime() - 10 * 60 * 1000); // subtract 1 minute $$

        const filter: BookingsVariables = {
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

        const variables = new NaturalQueryVariablesManager<BookingsVariables>();
        variables.set('variables', filter);

        server.bookingService.getAll(variables).subscribe(result => {
            //console.log("checksBookablesAvailabilityBeforeConfirming(): ", result);
            Cahier.actualizeConfirmKnowingBookablesAvailability(clone(result.items));
        });
    },

    // getActualBookingList()
    getActualBookingList: function (): void {
        //console.log("GET ACTUAL BOOKING LIST");

        const filter: BookingsVariables = {
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

        const variables = new NaturalQueryVariablesManager<BookingsVariables>();
        variables.set('variables', filter);

        server.bookingService.getAll(variables).subscribe(result => {
            // force = true
            loadBottoms();
            loadActualBookings(mergeBookings(clone(result.items)));
        });
    },

    // getFinishedBookingListForDay()
    getFinishedBookingListForDay: function (d: Date, title: string): void {
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
        const filter: BookingsVariables = {
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

        const variables = new NaturalQueryVariablesManager<BookingsVariables>();
        variables.set('variables', filter);

        server.bookingService.getAll(variables).subscribe(result => {
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
    },

    // getBookableHistory()
    getBookableHistory: function (bookableId: string, elem: HTMLElement, lastDate: Date, Size = 10): void {
        //console.log("getbookableHistory", bookableId, "lastDate:", lastDate, "Size",Size);

        const filter: BookingsVariables = {
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

        const variables = new NaturalQueryVariablesManager<BookingsVariables>();
        variables.set('variables', filter);

        server.bookingService.getAll(variables).subscribe(first => {
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

                const filter: BookingsVariables = {
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

                const variables = new NaturalQueryVariablesManager<BookingsVariables>();
                variables.set('variables', filter);

                server.bookingService.getAll(variables).subscribe(addition => {
                    //console.log("getBookableHistory()_Addition: ", addition);
                    const total = bookings.concat(addition.items);
                    actualizePopBookableHistory(total, elem);
                });
            }
        });
    },

    getBookingsNbrBetween: function (
        start: Date,
        end: Date,
        bookableId = '%',
        elem: HTMLElement = document.body,
        writeIfOne = true,
    ): void {
        const filter: BookingsVariables = {
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

        const variables = new NaturalQueryVariablesManager<BookingsVariables>();
        variables.set('variables', filter);

        server.bookingService.getAll(variables).subscribe(result => {
            //console.log("getBookingsNbrBetween(): ", result.length + " sorties", result);
            if (result.length != 1 || writeIfOne) {
                elem.innerHTML += result.length;
                elem.parentElement!.style.opacity = '1';
            }
        });
    },

    // getMonthlyBookingsNbr for divBottoms
    getMonthlyBookingsNbr: function (start: Date, end: Date): void {
        end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 99);

        const filter: BookingsVariables = {
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

        const variables = new NaturalQueryVariablesManager<BookingsVariables>();
        variables.set('variables', filter);

        server.bookingService.getAll(variables).subscribe(result => {
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
    },

    getStats: function (start: Date, end: Date, elem: Element): void {
        const f: BookingsVariables = {
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

        const variables = new NaturalQueryVariablesManager<BookingsVariables>();
        variables.set('variables', f);

        server.bookingService.getAll(variables).subscribe(result => {
            //console.log("getStats(): ", result);
            const send = mergeBookings(clone(result.items));
            actualizeStats(start, end, elem, send);
        });
    },

    getBookingWithBookablesInfos: function (_booking: Booking, which: PopBookingWhich, elem: Element): void {
        const filter: BookingsVariables = {
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

        const variables = new NaturalQueryVariablesManager<BookingsVariables>();
        variables.set('variables', filter);

        server.bookingService.getAll(variables).subscribe(result => {
            const send = mergeBookings(result.items);
            actualizePopBooking(send[0] as ActualizePopBooking, which, elem); // should only give one booking
        });
    },

    // finishBooking
    terminateBooking: function (bookingIds: string[], comments: string[], realTerminate = true): void {
        let c = 0;

        for (let i = 0; i < bookingIds.length; i++) {
            //console.log("terminateBooking", bookingIds[i], comments[i]);
            server.bookingService.terminateBooking(bookingIds[i], comments[i]).subscribe(() => {
                c++;
                if (c === bookingIds.length) {
                    if (realTerminate) {
                        Requests.getActualBookingList();
                    } else {
                        console.log('Requests.terminateBooking() has finished, creating booking now.');
                        Requests.createBooking();
                    }
                    //console.log("this.terminateBooking done !");
                }
            });
        }
    },

    terminateCreateAndUpdateBookings: function (
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

        const finished = (): void => Requests.createAndUpdateBookings(inputsToCreate, idsToUpdate, inputsToUpdate);

        if (idsToFinish.length == 0) finished();

        let c = 0; // counter variable

        // ToFinish
        for (let i = 0; i < idsToFinish.length; i++) {
            //          console.log("Terminate:", idsToFinish[i], commentsToFinish[i]);
            server.bookingService.terminateBooking(idsToFinish[i], commentsToFinish[i]).subscribe(() => {
                c++;
                if (c == idsToFinish.length) finished();
            });
        }
    },

    createAndUpdateBookings: function (
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
            server.bookingService.updateNow(extendInput(idsToUpdate[i], inputsToUpdate[i])).subscribe(() => {
                c++;
                if (c == total) finished();
            });
        }

        // ToCreate
        for (const item of inputsToCreate) {
            //            console.log("Create:", inputsToCreate[i]);
            server.bookingService.create(item).subscribe(() => {
                c++;
                if (c == total) finished();
            });
        }
    },

    getServerInputsForBookingCreating: function (
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
    },

    // createBooking2
    createBooking: function (): void {
        let c = 0;
        const bookingInputs = Requests.getServerInputsForBookingCreating(Cahier.bookings[0]);
        for (const input of bookingInputs) {
            server.bookingService.create(input).subscribe(() => {
                c++;
                if (c == bookingInputs.length) {
                    newTab('divTabCahier');
                    ableToSkipAnimation();
                    stopWaiting();
                }
            });
        }
    },

    getOwnerLicenses: function (_owner: {id: string}): void {
        server.userService.getOne(_owner.id).subscribe(result => {
            //            console.log("getOwnerLicenses(): ", result);
            const owner = {...result};
            Cahier.setOwnerLicenses(owner);
        });
    },

    getBookablesLicenses: function (_bookableIds: string[]): void {
        const filter: BookablesVariables = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                id: {
                                    in: {
                                        values: _bookableIds,
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            pagination: {
                pageSize: _bookableIds.length,
                pageIndex: 0,
            },
        };

        const variables = new NaturalQueryVariablesManager<BookablesVariables>();
        variables.set('variables', filter);

        server.bookableService.getAll(variables).subscribe(result => {
            //            console.log("getBookablesLicenses(): ", result.items);
            Cahier.updateBookablesLicenses(result.items);
        });
    },
};
