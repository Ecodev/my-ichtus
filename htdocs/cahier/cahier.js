import {Cahier, getEndCommentFromBooking, getStartCommentFromBooking} from './methods.js';
import {$, div, is0second, options} from '../general/home.js';
import {popBookingFinish, popBookingInfos} from './pop-booking.js';
import {popBookable} from '../equipment/pop-bookable.js';
import {Requests} from '../general/server-requests.js';

export function loadActualBookings(_actualBookings) {
    Cahier.actualBookings = _actualBookings;

    $('divTabCahierTableActualBookings').previousElementSibling.innerHTML =
        'Sorties en cours (' + _actualBookings.length + ')';

    let bookableNbr = 0;
    let participantNbr = 0;

    for (let i = 0; i < _actualBookings.length; i++) {
        participantNbr += _actualBookings[i].participantCount;
        bookableNbr += _actualBookings[i].bookables.length;
    }

    $('divTabCahierTableActualBookings').previousElementSibling.title =
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

function coloring(booking) {
    if (booking.creator.name.toLowerCase() !== 'booking only') {
        return 'orange';
    } else if (is0second(booking)) {
        return 'gray';
    } else return 'green';
}

function actualizeActualBookings(_actualBookings) {
    const all = $('divTabCahierTableActualBookings').getElementsByClassName('TableEntries');
    for (let i = 0; i < all.length; i++) {
        if (all[i].id != 'divTabCahierTableActualBookingsTopBar') {
            all[i].parentNode.removeChild(all[i]);
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
        container.id = j;
        container.classList.add('TableEntries');
        container.classList.add('TableEntriesHover');

        if (options.seeExtraInfos) {
            container.style.backgroundColor = coloring(_actualBookings[j]);
        }

        container.addEventListener('click', function (event) {
            if (event.target.classList.contains('Buttons')) {
                popBookingFinish(_actualBookings[this.id]);
            } else if (
                event.target.parentElement.classList.contains('TableEntriesBookableBox') ||
                event.target.parentElement.parentElement.classList.contains('TableEntriesBookableBox')
            ) {
                // do nothing
            } else if (typeof event.target.getElementsByTagName('div')[0] != 'undefined') {
                if (event.target.getElementsByTagName('div')[0].classList.contains('Buttons')) {
                    popBookingFinish(_actualBookings[this.id]);
                } else {
                    popBookingInfos(_actualBookings[this.id]);
                }
            } else {
                popBookingInfos(_actualBookings[this.id]);
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
        divDate.innerHTML += new Date(_actualBookings[j].startDate).getNiceTime(':', true);

        const participantCount = div(container);
        participantCount.innerHTML = _actualBookings[j].participantCount;
        participantCount.title = Cahier.getSingularOrPlural(_actualBookings[j].participantCount, ' Participant');

        div(container).innerHTML = Cahier.getOwner(_actualBookings[j], true);

        if (_actualBookings[j].bookables.length == 0) {
            createBookingBookableBox(div(container));
        } else {
            const c = div(container);
            for (let k = 0; k < _actualBookings[j].bookables.length; k++) {
                createBookingBookableBox(c, _actualBookings[j].bookables[k]);
            }
        }

        div(container).innerHTML = _actualBookings[j].destination.shorten(150, 16);

        div(container).innerHTML = getStartCommentFromBooking(_actualBookings[j]).shorten(200, 16);

        const d = div(container);
        d.title = 'Terminer ou modifier cette sortie';
        const btn = div(d);
        btn.classList.add('Buttons');
    }
    sortTable($('divTabCahierTableActualBookings'));
}

// new search system
export function bookingTableSearch(_table) {
    let bookings;
    const txts = _table.previousElementSibling.previousElementSibling.value.split(' ');
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
    const result = [];

    for (let t = 0; t < txts.length; t++) {
        result[t] = [];
        for (let b = 0; b < bookings.length; b++) {
            let add = false;

            // fields taken into account in the search
            if (bookings[b].owner.name.toUpperCase().includes(txts[t].toUpperCase())) {
                add = true;
            } else if (new Date(bookings[b].startDate).getNiceTime(':', true).includes(txts[t].toUpperCase())) {
                add = true;
            } else if (new Date(bookings[b].endDate).getNiceTime(':', true).includes(txts[t].toUpperCase())) {
                add = true;
            } else if (bookings[b].destination.toUpperCase().includes(txts[t].toUpperCase())) {
                add = true;
            } else if (bookings[b].startComment.toUpperCase().includes(txts[t].toUpperCase())) {
                add = true;
            } else if (bookings[b].endComment.toUpperCase().includes(txts[t].toUpperCase())) {
                add = true;
            } else if (bookings[b].participantCount.toString().includes(txts[t])) {
                add = true;
            } else {
                for (let e = 0; e < bookings[b].bookables.length; e++) {
                    if (bookings[b].bookables[e].name.toUpperCase().includes(txts[t].toUpperCase())) {
                        add = true;
                        break;
                    } else if (bookings[b].bookables[e].code.toUpperCase().includes(txts[t].toUpperCase())) {
                        add = true;
                        break;
                    }
                }
            }
            if (add) {
                result[t].push(bookings[b]);
            }
        }
    }

    // merge but only take the bookings which are in every search result !
    const send = result.mergeAND();
    if (_table == $('divTabCahierTableActualBookings')) {
        actualizeActualBookings(send);
    } else {
        actualizeFinishedBookingListForDay(send, _table);
    }
}

function createBookingBookableBox(elem, bookable = {code: 'ZZZ'}) {
    const d = div(elem);
    if (bookable.code != null) {
        d.id = bookable.code;
    } else {
        d.id = '999';
    }

    const img = div(d);
    const code = div(d);

    if (bookable == Cahier.personalBookable) {
        img.style.backgroundImage = 'url(img/icons/own-sail.png)';
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
            const codeLength = bookable.code.pixelLength(20);
            div(d).innerHTML = bookable.name.shorten(170 - codeLength, 18);
        } else {
            code.innerHTML = '';
            div(d).innerHTML = bookable.name.shorten(170 - 0, 18);
        }
    }
    elem.classList.add('TableEntriesBookableBox');
}

export function loadTableTopBars(allTables = document.getElementsByClassName('BookingsTable')) {
    for (let u = 0; u < allTables.length; u++) {
        const table = allTables[u];
        const top = table.getElementsByClassName('TableTopBar')[0];
        const all = top.getElementsByTagName('div');

        for (let i = 0; i < all.length; i = i + 2) {
            all[i].getElementsByTagName('div')[0].style.backgroundImage = 'url(img/icons/sort-asc.png)';

            if (!(all[i].parentElement.id == 'divTabCahierTableActualBookingsTopBar' && all[i].id == '6')) {
                // not sort finish buttons

                all[i].addEventListener('click', function () {
                    if (
                        this.getElementsByTagName('div')[0].style.backgroundImage == 'url("img/icons/sort-desc.png")' ||
                        !this.classList.contains('BookingsTopBarSorted')
                    ) {
                        this.getElementsByTagName('div')[0].style.backgroundImage = 'url(img/icons/sort-asc.png)';
                    } else {
                        this.getElementsByTagName('div')[0].style.backgroundImage = 'url(img/icons/sort-desc.png)';
                    }

                    const allButtons = this.parentElement.getElementsByTagName('div');
                    for (let k = 0; k < all.length; k = k + 2) {
                        if (allButtons[k] != this) {
                            allButtons[k].classList.remove('BookingsTopBarSorted');
                            allButtons[k].getElementsByTagName('div')[0].style.backgroundImage =
                                'url(img/icons/sort-asc.png)';
                        }
                    }
                    this.classList.add('BookingsTopBarSorted');

                    sortTable(this.parentElement.parentElement);
                });
            }
        }
    }
}

function sortTable(table) {
    const field = parseInt(table.getElementsByClassName('BookingsTopBarSorted')[0].id);
    const order = function () {
        if (
            table.getElementsByClassName('BookingsTopBarSorted')[0].getElementsByTagName('div')[0].style
                .backgroundImage == 'url("img/icons/sort-desc.png")'
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
                all[i].parentElement.insertBefore(all[i + 1], all[i]);
                switching = true;
            }
        }
    }
}

function getSortingText(elem) {
    if (elem.id.indexOf('SORTING') == 0) {
        return elem.id;
    } else {
        return elem.innerHTML.toUpperCase();
    }
}

export function newBookingTable(date, title = '?') {
    if (title == '?') {
        title = date.getNiceDate();
    }
    Requests.getFinishedBookingListForDay(date, undefined, title);

    $('divTabCahierButtonMoreBookingsContainer').getElementsByTagName('div')[0].id = date.getPreviousDate();
    $('divTabCahierButtonMoreBookingsContainer').getElementsByTagName('div')[0].innerHTML =
        'Charger les sorties du ' + date.getPreviousDate().getNiceDate(true);
}

export function createBookingsTable(date, title) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = '';
    input.spellcheck = false;
    input.placeholder = 'Rechercher';
    $('divTabCahierTables').appendChild(input);

    const t = div($('divTabCahierTables'));
    t.classList.add('BookingsTableText');
    if (title == '?') {
        title = date.getNiceDate();
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
        d.id = i;
        div(d);
        const img = document.createElement('img');
        img.src = 'img/' + images[i] + '.png';
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

export function createNoBookingMessage(date) {
    const t = div($('divTabCahierTables'));
    t.classList.add('BookingsTableTextNoBooking');
    t.innerHTML = 'Aucune sortie le ' + date.getNiceDate();
}

export function actualizeFinishedBookingListForDay(bookings, table) {
    const all = table.getElementsByClassName('TableEntries');
    for (let i = 0; i < all.length; i++) {
        if (all[i].classList.contains('TableTopBar') === false) {
            all[i].parentNode.removeChild(all[i]);
            i--;
        }
    }

    let participantNbr = 0,
        bookableNbr = 0;
    for (let j = 0; j < bookings.length; j++) {
        participantNbr += bookings[j].participantCount;
        bookableNbr += bookings[j].bookables.length;
    }
    table.previousElementSibling.title = bookableNbr + ' embarcations, ' + participantNbr + ' personnes';

    if (bookings.length === 0) {
        const ent = div(table);
        ent.classList.add('TableEntries');
        ent.classList.add('TableEntriesHover');
        div(ent);
    } else {
        for (let i = 0; i < bookings.length; i++) {
            const entry = div(table);
            entry.id = i;
            entry.classList.add('TableEntries');
            entry.classList.add('TableEntriesHover');
            entry.addEventListener('click', function (event) {
                if (
                    !(
                        event.target.parentElement.classList.contains('TableEntriesBookableBox') ||
                        event.target.parentElement.parentElement.classList.contains('TableEntriesBookableBox')
                    )
                ) {
                    popBookingInfos(bookings[this.id]);
                }
            });

            if (options.seeExtraInfos) {
                entry.style.backgroundColor = coloring(bookings[i]);
            }

            div(entry).innerHTML = new Date(bookings[i].startDate).getNiceTime(':', true);
            div(entry).innerHTML = new Date(bookings[i].endDate).getNiceTime(':', true);
            div(entry).innerHTML = bookings[i].participantCount;
            div(entry).innerHTML = Cahier.getOwner(bookings[i], true);

            if (bookings[i].bookables.length === 0) {
                createBookingBookableBox(div(entry));
            } else {
                const c = div(entry);
                for (let k = 0; k < bookings[i].bookables.length; k++) {
                    createBookingBookableBox(c, bookings[i].bookables[k]);
                }
            }

            div(entry).innerHTML = bookings[i].destination.shorten(150, 16);
            div(entry).innerHTML = getStartCommentFromBooking(bookings[i]).shorten(200, 16); // "".shorten(200, 200);//getStartCommentFromBooking(bookings[i]);//.startComment.shorten(200, 20); // BIZARRRRERELRKJASéDL KFJASéDLF JKAéSLDKFJ
            div(entry).innerHTML = getEndCommentFromBooking(bookings[i]).shorten(200, 16); //.endComment.shorten(200, 20);
        }
        sortTable(table);
    }
}
