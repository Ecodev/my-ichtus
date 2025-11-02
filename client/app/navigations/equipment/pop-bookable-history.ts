import {closePopUp, div, getNiceDate, getNiceTime, grayBar, inverse, Mois, openPopUp, shorten} from '../general/home';
import {type Booking, Requests} from '../general/server-requests';
import {popBooking} from '../cahier/pop-booking';
import {Cahier, getStartCommentFromBooking} from '../cahier/methods';

let currentYear = -1;
let currentMonth = -1;
let currentDay = -1;

export function popBookableHistory(bookableId: string): void {
    currentYear = -1;
    currentMonth = -1;
    currentDay = -1;

    const modal = openPopUp();

    Requests.getBookableHistory(bookableId, modal, new Date());

    const container = div(modal);
    container.classList.add('Boxes');
    container.style.position = 'absolute';
    container.style.width = '700px';
    container.style.top = '50%';
    container.style.marginLeft = '0px';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%,-50%)';
    container.style.padding = '10px';
    container.classList.add('PopUpBookableHistoryContainer');

    container.innerHTML += '<div style=" font-size:25px; text-align:center; color:black;">Historique</div>';
    grayBar(container, 5);

    const close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: modal});
    };

    const scroll = div(container);
    scroll.className = 'PopUpBookableHistoryContainerScroll';
}

export function actualizePopBookableHistory(bookings: Booking[], elem: HTMLElement): void {
    const lastDate = new Date(bookings[bookings.length - 1].startDate); // avant changeDaySorting !

    bookings = changeDaySorting(bookings);

    const bookableId = bookings[0].bookable!.id;

    const container = elem.getElementsByTagName('div')[0];
    container.getElementsByTagName('div')[0].innerHTML = shorten(
        'Historique de ' + bookings[0].bookable?.name,
        600,
        25,
    );

    const scroll = container.getElementsByClassName('PopUpBookableHistoryContainerScroll')[0];

    if (scroll.getElementsByClassName('Buttons').length == 1) {
        scroll.removeChild(scroll.getElementsByClassName('Buttons')[0]);
        scroll.removeChild(scroll.getElementsByTagName('br')[0]);
    }

    for (let i = 0; i < bookings.length; i++) {
        const d = new Date(bookings[i].startDate);

        const newYear = d.getFullYear();
        if (newYear != currentYear) {
            const year = popUpYear(scroll, newYear);

            const start = new Date(d.getFullYear(), 0, 1, 0, 0, 1);
            const end = new Date(d.getFullYear() + 1, 0, 1, 0, 0, 0, 1);
            Requests.getBookingsNbrBetween(start, end, bookableId, year);
        }

        const newMonth = d.getMonth();
        if (newMonth != currentMonth || newYear != currentYear) {
            const month = popUpMonth(scroll, Mois[newMonth]);

            const start = new Date(d.getFullYear(), newMonth, 1, 0, 0, 0, 1);
            const end = new Date(d.getFullYear(), newMonth + 1, 1, 0, 0, 0, 1);
            Requests.getBookingsNbrBetween(start, end, bookableId, month);
        }

        const newDay = d.getDate();
        if (newDay != currentDay || newMonth != currentMonth || newYear != currentYear) {
            const all = scroll.getElementsByClassName('PopUpMonth');

            const day = popUpDay(all[all.length - 1], getNiceDate(d, true));

            const start = new Date(d.getFullYear(), newMonth, newDay, 0, 0, 0, 1);
            const end = new Date(d.getFullYear(), newMonth, newDay + 1, 0, 0, 0, 1);
            Requests.getBookingsNbrBetween(start, end, bookableId, day, false);
        }

        currentYear = newYear;
        currentMonth = newMonth;
        currentDay = newDay;

        const all = scroll.getElementsByClassName('PopUpDay');

        const sortie = div(all[all.length - 1]);
        sortie.id = '' + i;
        sortie.classList.add('PopUpSortie');
        sortie.onclick = function () {
            popBooking(bookings[+(this as HTMLDivElement).id]);
        };
        div(sortie).innerHTML = getNiceTime(d);
        const c = div(sortie);

        div(c).innerHTML = Cahier.getOwner(bookings[i], true, {length: 240, fontSize: 20});

        shorten((div(c).innerHTML = bookings[i].destination), 150, 20);
        div(c).innerHTML = shorten(getStartCommentFromBooking(bookings[i]), 150, 15);
    }

    const space = document.createElement('br');
    scroll.appendChild(space);

    const plus = div(scroll);
    plus.classList.add('Buttons');
    plus.classList.add('NormalButtons');
    plus.innerHTML = 'Afficher plus';
    plus.onclick = function () {
        Requests.getBookableHistory(bookableId, elem, lastDate);
    };

    if (currentMonth != -1) {
        //   scroll.scrollTo(0, scroll.scrollHeight);
    }
}

function changeDaySorting(bookings: Booking[]): Booking[] {
    let i;
    let oldDate = new Date(bookings[0].startDate).getDate();
    let oldMonth = new Date(bookings[0].startDate).getMonth();

    const result = bookings;

    let c = 0;
    for (i = 1; i < result.length; i++) {
        const newDate = new Date(result[i].startDate).getDate();
        const newMonth = new Date(result[i].startDate).getMonth();
        if (oldDate == newDate && oldMonth == newMonth) {
            c++;
            //console.log("i:" + i, "c++");
        } else if (c != 0) {
            //c!=0
            const i1 = i - 1 - c;
            const i2 = i - 1;
            c = 0;
            //console.log("i:" + i,"switch - " + i1 + "to" + i2);
            inverse(result, i1, i2);
        }
        //console.log("i:" + i, "old:" + oldDate + "/" + oldMonth + "<br/>" + "new:" + newDate + "/" + newMonth + "<br/> c:" + c);
        oldDate = newDate;
        oldMonth = newMonth;
    }
    if (c != 0) {
        const i1 = i - 1 - c;
        const i2 = i - 1;
        inverse(result, i1, i2);
        //console.log("switch",i1, i2);
    }
    return result;
}

function popUpYear(container: Element, txt: number): HTMLDivElement {
    const c = div(container);
    c.className = 'PopUpYear';
    div(c);
    const inner = div(c);
    inner.innerHTML = '' + txt;
    const nbr = div(div(c));

    return nbr;
}

function popUpMonth(container: Element, txt: string): HTMLDivElement {
    const c = div(container);
    c.className = 'PopUpMonth';
    div(c);
    const inner = div(c);
    inner.innerHTML = txt;
    const nbr = div(div(c));

    return nbr;
}

function popUpDay(container: Element, txt: string): HTMLDivElement {
    const c = div(container);
    c.className = 'PopUpDay';

    const infos = div(c);

    div(infos);
    const inner = div(infos);
    inner.innerHTML = txt;
    const nbr = div(div(infos));

    return nbr;
}
