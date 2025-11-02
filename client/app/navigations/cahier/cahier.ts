import {Cahier, getEndCommentFromBooking, getStartCommentFromBooking} from './methods';
import {
    $,
    div,
    getNiceDate,
    getNiceTime,
    getPreviousDate,
    is0second,
    mergeAND,
    type MergedBooking,
    options,
    pixelLength,
    shorten,
} from '../general/home';
import {popBookingFinish, popBookingInfos} from './pop-booking';
import {popBookable} from '../equipment/pop-bookable';
import {type Bookable, type Booking, Requests} from '../general/server-requests';

export function loadActualBookings(_actualBookings: MergedBooking[]): void {
    Cahier.actualBookings = _actualBookings;

    $('divTabCahierTableActualBookings').previousElementSibling!.innerHTML =
        'Sorties en cours (' + _actualBookings.length + ')';

    let bookableNbr = 0;
    let participantNbr = 0;

    for (const item of _actualBookings) {
        participantNbr += item.participantCount;
        bookableNbr += item.bookables!.length;
    }

    ($('divTabCahierTableActualBookings').previousElementSibling as HTMLElement).title =
        bookableNbr + ' embarcations, ' + participantNbr + ' personnes';

    const children = $('divTabCahierTables').children;
    for (let j = 0; j < children.length; j++) {
        if (
            children[j].id != 'divTabCahierTableActualBookings' &&
            children[j].id != 'inputTabCahierActualBookingsSearch' &&
            children[j].id != 'divTabCahierActualBookingsSearchTitle' &&
            children[j].id != 'divTabCahierAlertButtonsLegend'
        ) {
            $('divTabCahierTables').removeChild(children[j]);
            j--;
        }
    }

    Cahier.finishedBookings = [];

    newBookingTable(new Date(), 'Sorties terminées'); // tables sorties finies

    $('inputTabCahierActualBookingsSearch').value = '';

    actualizeActualBookings(Cahier.actualBookings);
}

function coloring(booking: Booking): string {
    if (booking.creator?.name.toLowerCase() !== 'booking only') {
        return 'orange';
    } else if (is0second(booking)) {
        return 'gray';
    } else return 'green';
}

function actualizeActualBookings(_actualBookings: MergedBooking[]): void {
    const all = $('divTabCahierTableActualBookings').getElementsByClassName('TableEntries');
    for (let i = 0; i < all.length; i++) {
        if (all[i].id != 'divTabCahierTableActualBookingsTopBar') {
            all[i].parentNode!.removeChild(all[i]);
            i--;
        }
    }

    if (_actualBookings.length == 0) {
        const entry = div($('divTabCahierTableActualBookings'));
        entry.classList.add('TableEntries');
        entry.classList.add('TableEntriesHover');
        div(entry);
    }

    for (let j = 0; j < _actualBookings.length; j++) {
        const container = div($('divTabCahierTableActualBookings'));
        container.id = '' + j;
        container.classList.add('TableEntries');
        container.classList.add('TableEntriesHover');

        if (options.seeExtraInfos) {
            container.style.backgroundColor = coloring(_actualBookings[j]);
        }

        container.addEventListener('click', function (event) {
            const target = event.target as HTMLElement;
            const id = +(this as HTMLElement).id;
            if (target.classList.contains('Buttons')) {
                popBookingFinish(_actualBookings[id]);
            } else if (
                target.parentElement!.classList.contains('TableEntriesBookableBox') ||
                target.parentElement!.parentElement!.classList.contains('TableEntriesBookableBox')
            ) {
                // do nothing
            } else if (typeof target.getElementsByTagName('div')[0] != 'undefined') {
                if (target.getElementsByTagName('div')[0].classList.contains('Buttons')) {
                    popBookingFinish(_actualBookings[id]);
                } else {
                    popBookingInfos(_actualBookings[id]);
                }
            } else {
                popBookingInfos(_actualBookings[id]);
            }
        });

        const divDate = div(container);

        const maxHours = 24;
        if (Date.now() - new Date(_actualBookings[j].startDate).getTime() > (maxHours / 6) * 60 * 60 * 1000) {
            const d = div(divDate);
            d.classList.add('TableEntriesAlert');
            d.style.filter = 'grayscale(1) invert(1)';
            d.title = '+ de 4 heures';
            divDate.title = '+ de 4 heures';

            if (Date.now() - new Date(_actualBookings[j].startDate).getTime() > (maxHours / 2) * 60 * 60 * 1000) {
                d.style.filter = 'none';
                d.style.filter = 'grayscale(1)';
                d.title = '+ de 12 heures';
                divDate.title = '+ de 12 heures';
            }

            if (Date.now() - new Date(_actualBookings[j].startDate).getTime() > maxHours * 60 * 60 * 1000) {
                d.style.filter = 'none';
                d.title = '+ de 24 heures';
                divDate.title = '+ de 24 heures';
            }
        }

        divDate.id = 'SORTING' + new Date(_actualBookings[j].startDate).toISOString(); // for the sorting
        divDate.innerHTML += getNiceTime(new Date(_actualBookings[j].startDate), ':', true);

        const participantCount = div(container);
        participantCount.innerHTML = '' + _actualBookings[j].participantCount;
        participantCount.title = Cahier.getSingularOrPlural(_actualBookings[j].participantCount, ' Participant');

        div(container).innerHTML = Cahier.getOwner(_actualBookings[j], true);

        if (_actualBookings[j].bookables?.length == 0) {
            createBookingBookableBox(div(container));
        } else {
            const c = div(container);
            for (const bookable of _actualBookings[j].bookables!) {
                createBookingBookableBox(c, bookable as Bookable);
            }
        }

        div(container).innerHTML = shorten(_actualBookings[j].destination, 150, 16);

        div(container).innerHTML = shorten(getStartCommentFromBooking(_actualBookings[j]), 200, 16);

        const d = div(container);
        d.title = 'Terminer ou modifier cette sortie';
        const btn = div(d);
        btn.classList.add('Buttons');
    }
    sortTable($('divTabCahierTableActualBookings'));
}

// new search system
export function bookingTableSearch(_table: HTMLDivElement): void {
    let bookings;
    const txts = (_table.previousElementSibling!.previousElementSibling as HTMLInputElement).value.split(' ');
    // means finishedBookings
    if (_table != $('divTabCahierTableActualBookings')) {
        let i;
        const all = document.getElementsByClassName('BookingsTable');
        for (i = 1; i < all.length; i++) {
            if (all[i] == _table) {
                break;
            }
        }
        bookings = Cahier.finishedBookings[i - 1];
    } else {
        // means actualBookings
        bookings = Cahier.actualBookings;
    }
    const result: MergedBooking[][] = [];

    for (let t = 0; t < txts.length; t++) {
        result[t] = [];
        for (const booking of bookings) {
            let add = false;

            // fields taken into account in the search
            if (booking.owner?.name.toUpperCase().includes(txts[t].toUpperCase())) {
                add = true;
            } else if (getNiceTime(new Date(booking.startDate), ':', true).includes(txts[t].toUpperCase())) {
                add = true;
            } else if (
                booking.endDate &&
                getNiceTime(new Date(booking.endDate), ':', true).includes(txts[t].toUpperCase())
            ) {
                add = true;
            } else if (booking.destination.toUpperCase().includes(txts[t].toUpperCase())) {
                add = true;
            } else if (booking.startComment.toUpperCase().includes(txts[t].toUpperCase())) {
                add = true;
            } else if (booking.endComment.toUpperCase().includes(txts[t].toUpperCase())) {
                add = true;
            } else if (booking.participantCount.toString().includes(txts[t])) {
                add = true;
            } else {
                for (const bookable of booking.bookables ?? []) {
                    if (bookable?.name.toUpperCase().includes(txts[t].toUpperCase())) {
                        add = true;
                        break;
                    } else if (bookable?.code?.toUpperCase().includes(txts[t].toUpperCase())) {
                        add = true;
                        break;
                    }
                }
            }
            if (add) {
                result[t].push(booking);
            }
        }
    }

    // merge but only take the bookings which are in every search result !
    const send = mergeAND(result);
    if (_table == $('divTabCahierTableActualBookings')) {
        actualizeActualBookings(send);
    } else {
        actualizeFinishedBookingListForDay(send, _table);
    }
}

function createBookingBookableBox(elem: HTMLElement, bookable: Bookable = {code: 'ZZZ'} as Bookable): void {
    const d = div(elem);
    if (bookable.code != null) {
        d.id = bookable.code;
    } else {
        d.id = '999';
    }

    const img = div(d);
    const code = div(d);

    if (bookable.id == '0') {
        img.style.backgroundImage = 'url(assets/navigations/icons/own-sail.png)';
        code.style.backgroundImage = 'none';
        code.innerHTML = Cahier.personalBookable.name;
        code.style.margin = '0px';
        code.style.fontSize = '16px';
        code.style.lineHeight = '35px';
        d.style.cursor = 'unset';
        d.id = 'ZZZZ'; // // to be at the bottom of the list
        d.style.backgroundColor = 'transparent';
    } else {
        d.onclick = function () {
            popBookable(bookable.id);
        };
        img.style.backgroundImage = Cahier.getImageUrl(bookable, 35);

        if (bookable.code != null) {
            code.innerHTML = bookable.code;
            const codeLength = pixelLength(bookable.code, 20);
            div(d).innerHTML = shorten(bookable.name, 170 - codeLength, 18);
        } else {
            code.innerHTML = '';
            div(d).innerHTML = shorten(bookable.name, 170 - 0, 18);
        }
    }
    elem.classList.add('TableEntriesBookableBox');
}

export function loadTableTopBars(
    allTables: HTMLCollectionOf<Element> | Element[] = document.getElementsByClassName('BookingsTable'),
): void {
    for (const table of allTables) {
        const top = table.getElementsByClassName('TableTopBar')[0];
        const all = top.getElementsByTagName('div');

        for (let i = 0; i < all.length; i = i + 2) {
            all[i].getElementsByTagName('div')[0].style.backgroundImage = 'url(assets/navigations/icons/sort-asc.png)';

            if (!(all[i].parentElement?.id == 'divTabCahierTableActualBookingsTopBar' && all[i].id == '6')) {
                // not sort finish buttons

                all[i].addEventListener('click', function () {
                    if (
                        this.getElementsByTagName('div')[0].style.backgroundImage ==
                            'url("assets/navigations/icons/sort-desc.png")' ||
                        !this.classList.contains('BookingsTopBarSorted')
                    ) {
                        this.getElementsByTagName('div')[0].style.backgroundImage =
                            'url(assets/navigations/icons/sort-asc.png)';
                    } else {
                        this.getElementsByTagName('div')[0].style.backgroundImage =
                            'url(assets/navigations/icons/sort-desc.png)';
                    }

                    const allButtons = this.parentElement!.getElementsByTagName('div');
                    for (let k = 0; k < all.length; k = k + 2) {
                        if (allButtons[k] != this) {
                            allButtons[k].classList.remove('BookingsTopBarSorted');
                            allButtons[k].getElementsByTagName('div')[0].style.backgroundImage =
                                'url(assets/navigations/icons/sort-asc.png)';
                        }
                    }
                    this.classList.add('BookingsTopBarSorted');

                    sortTable(this.parentElement!.parentElement!);
                });
            }
        }
    }
}

function sortTable(table: HTMLElement): void {
    const field = parseInt(table.getElementsByClassName('BookingsTopBarSorted')[0].id);
    const order = function (): -1 | 1 {
        if (
            table.getElementsByClassName('BookingsTopBarSorted')[0].getElementsByTagName('div')[0].style
                .backgroundImage == 'url("assets/navigations/icons/sort-desc.png")'
        ) {
            return -1;
        } else {
            return 1;
        }
    };

    const all = table.getElementsByClassName('TableEntries');
    let switching = true;
    while (switching) {
        switching = false;
        for (let i = 1; i < all.length - 1; i++) {
            if (
                (getSortingText(all[i].children[field]) > getSortingText(all[i + 1].children[field]) && order() == 1) ||
                (getSortingText(all[i].children[field]) < getSortingText(all[i + 1].children[field]) && order() == -1)
            ) {
                all[i].parentElement!.insertBefore(all[i + 1], all[i]);
                switching = true;
            }
        }
    }
}

function getSortingText(elem: Element): string {
    if (elem.id.startsWith('SORTING')) {
        return elem.id;
    } else {
        return elem.innerHTML.toUpperCase();
    }
}

export function newBookingTable(date: Date, title = '?'): void {
    if (title == '?') {
        title = getNiceDate(date);
    }
    Requests.getFinishedBookingListForDay(date, title);

    const loadMoreButton = $('divTabCahierButtonMoreBookingsContainer').getElementsByTagName('div')[0];
    loadMoreButton.id = getPreviousDate(date).toString();
    loadMoreButton.innerHTML = 'Charger les sorties du ' + getNiceDate(getPreviousDate(date), true);
}

export function createBookingsTable(date: Date, title: string): HTMLDivElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = '';
    input.spellcheck = false;
    input.placeholder = 'Rechercher';
    $('divTabCahierTables').appendChild(input);

    const t = div($('divTabCahierTables'));
    t.classList.add('BookingsTableText');
    if (title == '?') {
        title = getNiceDate(date);
    }
    t.innerHTML = title;

    const table = div($('divTabCahierTables'));
    input.onkeyup = function () {
        bookingTableSearch(table);
    };
    table.id = date.toISOString();
    table.classList.add('BookingsTable');

    const topBar = div(table);
    topBar.classList.add('TableEntries');
    topBar.classList.add('TableTopBar');

    const fields = [
        '',
        '',
        '',
        'Responsable',
        'Embarcations',
        'Destination',
        'Commentaire de départ',
        "Commentaire d'arrivée",
    ];
    const images = [
        'icons/start',
        'icons/end',
        'icons/participant-count',
        'icons/responsible',
        'icons/sail',
        'icons/destination',
        'icons/start-comment',
        'icons/end-comment',
    ];

    for (let i = 0; i < fields.length; i++) {
        const d = div(topBar);
        d.id = '' + i;
        div(d);
        const img = document.createElement('img');
        img.src = 'assets/navigations/' + images[i] + '.png';
        img.alt = '?';
        d.appendChild(img);
        d.innerHTML += fields[i];
    }

    topBar.getElementsByTagName('div')[0].classList.add('BookingsTopBarSorted');

    const b = div(table);
    b.style.position = 'absolute';
    b.style.width = '100%';
    b.style.height = '2px';
    b.style.backgroundColor = 'gray';
    b.style.zIndex = '2';

    loadTableTopBars([table]);

    return table;
}

export function createNoBookingMessage(date: Date): void {
    const t = div($('divTabCahierTables'));
    t.classList.add('BookingsTableTextNoBooking');
    t.innerHTML = 'Aucune sortie le ' + getNiceDate(date);
}

export function actualizeFinishedBookingListForDay(bookings: MergedBooking[], table: HTMLDivElement): void {
    const all = table.getElementsByClassName('TableEntries');
    for (let i = 0; i < all.length; i++) {
        if (!all[i].classList.contains('TableTopBar')) {
            all[i].parentNode!.removeChild(all[i]);
            i--;
        }
    }

    let participantNbr = 0,
        bookableNbr = 0;
    for (const item of bookings) {
        participantNbr += item.participantCount;
        bookableNbr += item.bookables!.length;
    }
    (table.previousElementSibling as HTMLElement).title =
        bookableNbr + ' embarcations, ' + participantNbr + ' personnes';

    if (bookings.length === 0) {
        const ent = div(table);
        ent.classList.add('TableEntries');
        ent.classList.add('TableEntriesHover');
        div(ent);
    } else {
        for (let i = 0; i < bookings.length; i++) {
            const entry = div(table);
            entry.id = '' + i;
            entry.classList.add('TableEntries');
            entry.classList.add('TableEntriesHover');
            entry.addEventListener('click', function (event) {
                const parentElement = (event.target as HTMLElement).parentElement!;
                if (
                    !(
                        parentElement.classList.contains('TableEntriesBookableBox') ||
                        parentElement.parentElement!.classList.contains('TableEntriesBookableBox')
                    )
                ) {
                    popBookingInfos(bookings[+this.id]);
                }
            });

            const booking = bookings[i];
            if (options.seeExtraInfos) {
                entry.style.backgroundColor = coloring(booking);
            }

            div(entry).innerHTML = getNiceTime(new Date(booking.startDate), ':', true);
            div(entry).innerHTML = booking.endDate ? getNiceTime(new Date(booking.endDate), ':', true) : '';
            div(entry).innerHTML = '' + booking.participantCount;
            div(entry).innerHTML = Cahier.getOwner(booking, true);

            if (booking.bookables!.length === 0) {
                createBookingBookableBox(div(entry));
            } else {
                const c = div(entry);
                for (const bookable of booking.bookables ?? []) {
                    createBookingBookableBox(c, bookable as Bookable);
                }
            }

            div(entry).innerHTML = shorten(booking.destination, 150, 16);
            div(entry).innerHTML = shorten(getStartCommentFromBooking(booking), 200, 16); // "".shorten(200, 200);//getStartCommentFromBooking(bookings[i]);//.startComment.shorten(200, 20); // BIZARRRRERELRKJASéDL KFJASéDLF JKAéSLDKFJ
            div(entry).innerHTML = shorten(getEndCommentFromBooking(booking), 200, 16); //.endComment.shorten(200, 20);
        }
        sortTable(table);
    }
}
