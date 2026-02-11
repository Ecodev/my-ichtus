import {inject, Injectable} from '@angular/core';
import {NaturalAbstractModelService, NaturalQueryVariablesManager} from '@ecodev/natural';
import {
    BookableSortingField,
    BookablesQuery,
    BookablesQueryVariables,
    BookableStatus,
    BookingSortingField,
    type BookingsQueryVariables,
    BookingType,
    JoinType,
    LogicalOperator,
    SortingOrder,
} from '../shared/generated-types';
import {bookablesQuery} from '../admin/bookables/services/bookable.queries';
import {$, clone} from './general/home';
import {loadElements} from './equipment/elements';
import type {BookableWithExtra} from './types';
import {Cahier} from './cahier/methods';
import {actualizePopBookable, popBookable} from './equipment/pop-bookable';
import {BookingForVanillaService} from './booking-for-vanilla.service';
import {popAlert} from './general/pop-alert';

@Injectable({
    providedIn: 'root',
})
export class BookableForVanillaService extends NaturalAbstractModelService<
    never,
    never,
    BookablesQuery['bookables'],
    BookablesQueryVariables,
    never,
    never,
    never,
    never,
    never,
    never
> {
    private readonly bookingService = inject(BookingForVanillaService);
    public constructor() {
        super('bookable', null, bookablesQuery, null, null, null);
    }

    public getBookablesList(elem = $('inputTabCahierEquipmentElementsInputSearch')): void {
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

        const f: BookablesQueryVariables = {
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

        const variables = new NaturalQueryVariablesManager<BookablesQueryVariables>();
        variables.set('variables', f);

        this.getAll(variables).subscribe(result => {
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

                const filter: BookingsQueryVariables = {
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
                const variables = new NaturalQueryVariablesManager<BookingsQueryVariables>();
                variables.set('variables', filter);

                this.bookingService.getAll(variables).subscribe(result => {
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
    }

    // getBookableNbrForBookableTag()
    public getBookableNbrForBookableTag(bookableTag: string, elem: HTMLElement, before = '', after = ''): void {
        if (bookableTag == 'Canoe_Kayak') {
            bookableTag = 'Kayak';
        }
        if (bookableTag == 'Voile') {
            bookableTag = 'Voile lestée';
        }

        const filter: BookablesQueryVariables = {
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

        const variables = new NaturalQueryVariablesManager<BookablesQueryVariables>();
        variables.set('variables', filter);

        this.getAll(variables).subscribe(result => {
            const txt = before + result.length + after;
            elem.innerHTML = txt;
        });
    }

    public getBookableByCode(elem: HTMLInputElement, nbr = 0): void {
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
            const filter: BookablesQueryVariables = {
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

            const variables = new NaturalQueryVariablesManager<BookablesQueryVariables>();
            variables.set('variables', filter);

            this.getAll(variables).subscribe(result => {
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
    }

    public getBookableInfos(nbr: number, bookableId: string, elem: HTMLElement): void {
        const filter: BookablesQueryVariables = {
            filter: {
                groups: [{conditions: [{id: {like: {value: bookableId}}}]}],
            },
            pagination: {
                pageSize: 1,
                pageIndex: 0,
            },
        };

        const variables = new NaturalQueryVariablesManager<BookablesQueryVariables>();
        variables.set('variables', filter);

        this.getAll(variables).subscribe(result => {
            //console.log("getBookableInfos(): ", result);
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

            this.bookingService.getAll(variables).subscribe(bookings => {
                //console.log("getBookableInfos()_getLastBooking: ", bookings);
                const bookable = {...result.items[0]};
                actualizePopBookable(nbr, bookable, bookings, elem);
            });
        });
    }

    public getBookablesLicenses(_bookableIds: string[]): void {
        const filter: BookablesQueryVariables = {
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

        const variables = new NaturalQueryVariablesManager<BookablesQueryVariables>();
        variables.set('variables', filter);

        this.getAll(variables).subscribe(result => {
            //            console.log("getBookablesLicenses(): ", result.items);
            Cahier.updateBookablesLicenses(result.items);
        });
    }
}
