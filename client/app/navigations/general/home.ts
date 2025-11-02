//options
import {createProgressBar} from '../cahier/top';
import {createAllPropositions} from '../infos/infos';
import {loadBottoms} from '../page/bottom';
import {loadMateriel} from '../equipment/categories';
import {popUser} from '../member/user';
import {loadTableTopBars} from '../cahier/cahier';
import {loadCahierEquipmentChoice} from '../equipment/choice';
import {currentTabElement, setCurrentTabElement, tabs} from './screen';
import {type Booking, Requests} from './server-requests';
import {Cahier} from '../cahier/methods';

export const options = {
    bookablesComment: false,
    statsButtonTextActive: false,
    showRemarks: true,
    automaticConnexion: true,
    seeExtraInfos: false,
    bookingsTogetherWithDifferentEndates: true,
    modifyBookablesButton: true,
    editBookingButton: true,
    finishAllBookingsWithBookable: false, // si créer une sortie avec une embarcation déjà utilisée, ça termine seulement le booking avec l'embarcation utilisée de M. Uti.
    showAlertBookablesNotAvailable: false,
    showAlertNoWelcomeSession: true,
    minutesToEditBooking: 60, // after Fred's request
    lateHourWarning: 19, // starting from 19:00
    displayTerminatedEditedBookings: false, // don't show bookings that last 0 seconds
}; //showMetadatas: false,

// shortcut
export function $(id: 'btnEditBooking' | 'btnModify' | `btnNext` | `div${string}`): HTMLDivElement;
export function $(id: `input${string}`): HTMLInputElement;
export function $(id: string): HTMLElement {
    return document.getElementById(id)!;
}

// createElements
export function div(loc: Element): HTMLDivElement {
    const x = document.createElement('div');
    loc.appendChild(x);
    return x;
}

export function input(loc: HTMLElement, _placeholder = ''): HTMLInputElement {
    const x = document.createElement('input');
    x.autocomplete = 'off';
    x.type = 'text';
    x.spellcheck = false;
    x.placeholder = _placeholder;
    loc.appendChild(x);
    return x;
}

//Load
export function load(): void {
    setCurrentTabElement($('divTabCahier'));
    actualizeTime();
    setInterval(actualizeTime, 5000); //5 secondes
    createProgressBar();
    createAllPropositions();
    window.location.href = 'navigations#' + 'divTabCahier';
    loadReturnButtons();
    popUser(0, $('divTabCahierMemberContainer'));

    loadTableTopBars();
    loadCahierEquipmentChoice();
    loadEscListener();

    const version = '1.5';
    if (window.location.hostname === 'navigations.ichtus.club') {
        console.warn('Version de production ' + version);
        $('divTopBarText').innerHTML = tabs[0].title;
    } else {
        console.warn('Version de démo ' + version);
        tabs[0].title = 'Cahier de sortie (démo)';
        $('divTopBarText').innerHTML = tabs[0].title;
    }

    //SERVER
    Requests.checkLogin();

    //LOAD
    loadBottoms();
    loadMateriel();
}

// auto actualize if mouse doesn't move
let timeout: ReturnType<typeof setTimeout>;

function setTimeoutMove(): void {
    //console.log("start timeout");
    clearTimeout(timeout);
    timeout = setTimeout(
        function () {
            if (currentTabElement.id === 'divTabCahier') location.reload();
            else Requests.getActualBookingList();
        },
        1 * 60 * 1000,
    );
}

setTimeoutMove();

document.onmousemove = function () {
    setTimeoutMove();
};

// could be improved...
const Time = {
    getActualMinutes: function (m = date.getMinutes()) {
        let x;
        if (m < 10) {
            x = '0' + m;
        } else {
            x = m.toString();
        }
        return x;
    },
};

export function getNiceTime(date: Date, separator = ':', addZero = false): string {
    if (addZero && date.getHours() < 10) {
        return Time.getActualMinutes(date.getHours()) + separator + Time.getActualMinutes(date.getMinutes());
    } else {
        return date.getHours() + separator + Time.getActualMinutes(date.getMinutes());
    }
}
export function getNiceDate(date: Date, substr = false, year = false): string {
    let r = '';
    if (substr) {
        let month = Mois[date.getMonth()] as string;
        if (month.length > 4) month = month.substring(0, 3);
        r = Jours[date.getDay()] + ' ' + date.getDate() + ' ' + month;
    } else {
        r = Jours[date.getDay()] + ' ' + date.getDate() + ' ' + Mois[date.getMonth()];
    }
    if (year) {
        r += ' ' + date.getFullYear();
    }
    return r;
}

export function getPreviousDate(date: Date): Date {
    const yesterday = new Date(date);
    yesterday.setDate(date.getDate() - 1);
    return yesterday;
}

export function deltaTime(d1: Date, d2 = new Date(), bold = true): {text: string; time: number} {
    const delta = Math.abs(d2.getTime() - d1.getTime()) / 1000 / 60; // in minutes
    let t = '';

    if (delta < 1) t = "à l'instant";
    // [0;1[
    else if (delta < 3) t = 'il y a 2min';
    // [1;3[
    else if (delta < 7) t = 'il y a 5min';
    // [3;7[
    else if (delta < 13) t = 'il y a 10min';
    // [7;13[
    else if (delta < 22.5) t = 'il y a 15min';
    // [13;22.5[
    else if (delta < 37.5) t = 'il y a 30min';
    // [22.5;37.5[
    else if (delta < 52.5) t = 'il y a 45min';
    // [37.5;52.5[
    else if (delta * 60 < 1.25) t = 'il y a 1h';
    // [52.5;1.25[
    else if (delta * 60 < 1.75) t = 'il y a 1.5h';
    // [1.25;1.75[
    else if (delta * 60 < 2.5) t = 'il y a 2h';
    // [1.75;2.5[
    else if (delta * 60 < 3) t = 'il y a 3h';
    // [2.5;3[
    else t = 'il y a plus de 3 h'; // [3;+inf[

    // console.log("bold:", bold, "delta<13:", delta, "t:", t);

    return bold && delta < 13 ? {text: '<b>' + t + '</b>', time: delta} : {text: t, time: delta};
}

export function deleteElements(...elements: Element[]): void {
    for (const item of elements) {
        if (typeof item != 'undefined' && typeof item.parentElement != 'undefined' && item.parentElement != null) {
            item.parentElement?.removeChild(item);
        } else {
            //console.log("tried to delete a non-existent object");
        }
    }
}

//Time
let date: Date;
export const Jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as const;
export const Mois = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
] as const;

function actualizeTime(): void {
    date = new Date();
    $('divTopBarTime').innerHTML = getNiceTime(date) + '<br/>' + getNiceDate(date, true); //.substring(0, 3)
}

function loadReturnButtons(): void {
    const allReturnButtons = document.getElementsByClassName('ReturnButtons') as HTMLCollectionOf<HTMLElement>;
    for (const button of allReturnButtons) {
        button.title = 'Retour';
    }
}

// Modals
let lastModals = 0;

export function openPopUp(): HTMLDivElement {
    const modal = div(document.body);
    modal.onclick = function (event) {
        closePopUp(event);
    };
    lastModals++;
    modal.id = 'divModal' + lastModals;
    modal.classList.add('Modals');
    modal.style.display = 'block';
    setTimeout(function () {
        modal.style.opacity = '1';
    }, 10);

    $('divScreen').classList.add('Blur');
    $('divTopBar').classList.add('Blur');

    return modal;
}

export function closePopUp(e: 'last' | {target: HTMLElement | EventTarget | null}): void {
    let t = false;
    if (e == 'last') {
        if (lastModals != 0) {
            t = true;
        }
    } else if (e.target && 'id' in e.target && e.target.id.includes('divModal')) {
        t = true;
    }
    if (t) {
        const modal = $(`divModal${lastModals}`);
        modal.style.opacity = '0';
        setTimeout(function () {
            modal.style.display = 'none';
            modal.innerHTML = '';
            modal.parentNode!.removeChild(modal);
        }, 100);

        lastModals--;

        if (lastModals == 0) {
            $('divScreen').classList.remove('Blur');
            $('divTopBar').classList.remove('Blur');
        }
    }
}

function loadEscListener(): void {
    document.body.addEventListener('keydown', function (event) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        if (event.keyCode == 27) {
            //console.log("ESC");
            closePopUp('last');
        }
    });
}

export function waiting(): void {
    document.body.classList.add('waiting');
}

export function stopWaiting(): void {
    document.body.classList.remove('waiting');
}

export function pixelLength(text: string, _fontSize = 20): number {
    const c = document.createElement('span');
    document.body.appendChild(c);
    c.innerHTML = text;
    c.style.fontSize = _fontSize + 'px';
    const length = c.offsetWidth;
    document.body.removeChild(c);
    return length;
}

export function shorten(txt: string, maxLength: number, _fontSize = 20): string {
    if (txt == '' || pixelLength(txt, _fontSize) <= maxLength) {
        return txt;
    }
    while (pixelLength(txt + '...', _fontSize) > maxLength - pixelLength('...', _fontSize) && txt.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        txt = txt.substr(0, txt.length - 1);
    }
    return txt + '...';
}

export function grayBar(elem: HTMLElement, marginTop = 10, marginBottom = 15): HTMLDivElement {
    const d = div(elem);
    d.style.backgroundColor = 'lightgray';
    d.style.height = '2px';
    d.style.marginBottom = marginBottom + 'px';
    d.style.marginTop = marginTop + 'px';
    return d;
}

export function replaceTxtByTxt(text: string, replace = '', by = '', caseSensitive = false): string {
    let i = 0;
    const where = [];

    const txt = caseSensitive ? text : text.toUpperCase();
    const replaceTxt = caseSensitive ? replace : replace.toUpperCase();

    while (txt.includes(replaceTxt, i)) {
        where.push(txt.indexOf(replaceTxt, i));
        i = where[where.length - 1] + 1;
    }

    let r = '';
    for (let k = 0; k <= where.length; k++) {
        const start = k === 0 ? 0 : where[k - 1];
        const end = k === where.length ? text.length : where[k];
        const s = text.slice(start, end);
        const sTxt = caseSensitive ? s : s.toUpperCase();
        const x = sTxt.indexOf(replaceTxt);
        const t = x !== -1 ? s.slice(0, x) + by + s.slice(x + replace.length) : s;
        r += t;
    }
    return r;
}

// ARRAY PROTOTYPES
function switchSomething<T>(array: T[], i1: number, i2: number): T[] {
    const content_i1 = array[i1];
    array.splice(i1, 1, array[i2]);
    array.splice(i2, 1, content_i1);
    return array;
}

export function inverse<T>(array: T[], i1: number, i2: number): T[] {
    for (let i = i1; i < parseInt('' + ((i1 + i2) / 2 + 0.5)); i++) {
        switchSomething(array, i, i1 + i2 - i);
    }

    return array;
}

export function unique<T>(values: T[]): T[] {
    return [...new Set(values)];
}

export function fillArray<T>(length: number, what: T): T[] {
    return Array(length).fill(what);
}

// merge and only takes the elements which are in every array
export function mergeAND<T>(array: T[][]): T[] {
    const send = [];
    for (const item of array[0]) {
        let c = 0;
        for (let r2 = 1; r2 < array.length; r2++) {
            if (array[r2].findIndex(i => i == item) != -1) {
                c++;
            }
        }
        if (c == array.length - 1) {
            send.push(item);
        }
    }
    return send;
}

// clone
export function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

// check if booking is a terminated edited booking (i.e. lasting 0 seconds)
export function is0second(booking: Booking): boolean {
    return booking.startDate == booking.endDate;
}

function displayBooking(booking: Booking): boolean {
    if (options.seeExtraInfos || options.displayTerminatedEditedBookings) return true;
    return !is0second(booking);
}

export type MergedBooking = Booking & {
    bookables?: Booking['bookable'][];
    ids?: string[];
};

export function mergeBookings(bookings: Booking[]): MergedBooking[] {
    bookings = clone(bookings); // clone

    // assert the bookings have decreasing startDates, i.e. bookings[i-1].startDate (newer) >= bookings[i].startDate (older)
    for (let i = 1; i < bookings.length; i++) {
        if (
            !(
                new Date(bookings[i].startDate).getMilliseconds() -
                    new Date(bookings[i - 1].startDate).getMilliseconds() <=
                0
            )
        ) {
            console.warn(
                '[mergeBookings]: startDates:',
                bookings[i - 1].startDate,
                'is not >=',
                bookings[i].startDate,
                "aren't increasing !",
            );
        }
    }

    function canBeMerged(b1: Booking, b2: Booking): boolean {
        if (b1.startDate != b2.startDate) return false;
        if (b1.owner?.id != b2.owner?.id) return false;
        if (b1.endDate != b2.endDate && !options.bookingsTogetherWithDifferentEndates) return false;
        if ((is0second(b1) && !is0second(b2)) || (!is0second(b1) && is0second(b2))) return false; // XOR
        return true;
    }

    function mergeComments(c1: string, c2: string): string {
        const meaninglessComments = ['', 'Terminée automatiquement'];
        if (!meaninglessComments.includes(c1)) return c1;
        if (!meaninglessComments.includes(c2)) return c2;
        if (c1 != '') return c1;
        return c2;
    }

    const resultingBookings: MergedBooking[] = [];

    while (bookings.length > 0) {
        const booking = bookings.pop()!;

        // should not be kept
        if (!displayBooking(booking)) continue;

        // find potential booking to merge it with
        // --> can only be merged with the last bookings of resultingBookings since the startDates are decreasing
        let merged = false;
        for (let r = resultingBookings.length - 1; r >= 0; r--) {
            if (
                new Date(booking.startDate).getMilliseconds() -
                    new Date(resultingBookings[r].startDate).getMilliseconds() >
                0
            )
                break;

            if (canBeMerged(booking, resultingBookings[r])) {
                // can be merged --> merge
                resultingBookings[r].bookables!.push(
                    booking.bookable == null ? Cahier.personalBookable : booking.bookable,
                );
                resultingBookings[r].ids!.push(booking.id);
                resultingBookings[r].participantCount += booking.participantCount;
                resultingBookings[r].endComment = mergeComments(resultingBookings[r].endComment, booking.endComment);
                merged = true;
                break;
            }
        }

        // Couldn't merge --> append
        if (!merged) {
            resultingBookings.push(booking);
            resultingBookings[resultingBookings.length - 1].ids = [booking.id];
            resultingBookings[resultingBookings.length - 1].bookables = [
                booking.bookable == null ? Cahier.personalBookable : booking.bookable,
            ];
        }
    }
    return resultingBookings;
}
