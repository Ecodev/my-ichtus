let currentYear = -1;
let currentMonth = -1;
let currentDay = -1;

function popBookableHistory(bookableId) {
    currentYear = -1;
    currentMonth = -1;
    currentDay = -1;

    let modal = openPopUp();

    Requests.getBookableHistory(bookableId, modal, new Date());

    let container;
    container = div(modal);
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

    let close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: modal}, modal);
    };

    let scroll = div(container);
    scroll.className = 'PopUpBookableHistoryContainerScroll';
}

function actualizePopBookableHistory(bookings, elem) {
    let lastDate = new Date(bookings[bookings.length - 1].startDate); // avant changeDaySorting !

    bookings = changeDaySorting(bookings);

    let bookableId = bookings[0].bookable.id;

    let container = elem.getElementsByTagName('div')[0];
    container.getElementsByTagName('div')[0].innerHTML = ('Historique de ' + bookings[0].bookable.name).shorten(
        600,
        25,
    );

    let scroll = container.getElementsByClassName('PopUpBookableHistoryContainerScroll')[0];

    if (scroll.getElementsByClassName('Buttons').length == 1) {
        scroll.removeChild(scroll.getElementsByClassName('Buttons')[0]);
        scroll.removeChild(scroll.getElementsByTagName('br')[0]);
    }

    for (let i = 0; i < bookings.length; i++) {
        let d = new Date(bookings[i].startDate);

        let newYear = d.getFullYear();
        if (newYear != currentYear) {
            let year = popUpYear(scroll, newYear);

            let start = new Date(d.getFullYear(), 0, 1, 0, 0, 1);
            let end = new Date(d.getFullYear() + 1, 0, 1, 0, 0, 0, 1);
            Requests.getBookingsNbrBetween(start.toISOString(), end.toISOString(), bookableId, year);
        }

        let newMonth = d.getMonth();
        if (newMonth != currentMonth || newYear != currentYear) {
            let month = popUpMonth(scroll, Mois[newMonth]);

            let start = new Date(d.getFullYear(), newMonth, 1, 0, 0, 0, 1);
            let end = new Date(d.getFullYear(), newMonth + 1, 1, 0, 0, 0, 1);
            Requests.getBookingsNbrBetween(start.toISOString(), end.toISOString(), bookableId, month);
        }

        let newDay = d.getDate();
        if (newDay != currentDay || newMonth != currentMonth || newYear != currentYear) {
            let all = scroll.getElementsByClassName('PopUpMonth');

            let day = popUpDay(all[all.length - 1], d.getNiceDate(true));

            let start = new Date(d.getFullYear(), newMonth, newDay, 0, 0, 0, 1);
            let end = new Date(d.getFullYear(), newMonth, newDay + 1, 0, 0, 0, 1);
            Requests.getBookingsNbrBetween(start.toISOString(), end.toISOString(), bookableId, day, false);
        }

        currentYear = newYear;
        currentMonth = newMonth;
        currentDay = newDay;

        let all = scroll.getElementsByClassName('PopUpDay');

        let sortie = div(all[all.length - 1]);
        sortie.id = i;
        sortie.classList.add('PopUpSortie');
        sortie.onclick = function () {
            popBooking(bookings[this.id]);
        };
        div(sortie).innerHTML = d.getNiceTime();
        let c = div(sortie);

        div(c).innerHTML = Cahier.getOwner(bookings[i], true, {length: 240, fontSize: 20}, true);

        div(c).innerHTML = bookings[i].destination.shorten(150, 20);
        div(c).innerHTML = getStartCommentFromBooking(bookings[i]).shorten(150, 15);
    }

    let space = document.createElement('br');
    scroll.appendChild(space);

    let plus = div(scroll);
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

function changeDaySorting(bookings) {
    let i;
    let oldDate = new Date(bookings[0].startDate).getDate();
    let oldMonth = new Date(bookings[0].startDate).getMonth();

    let result = bookings;

    let c = 0;
    for (i = 1; i < result.length; i++) {
        let newDate = new Date(result[i].startDate).getDate();
        let newMonth = new Date(result[i].startDate).getMonth();
        if (oldDate == newDate && oldMonth == newMonth) {
            c++;
            //console.log("i:" + i, "c++");
        } else if (c != 0) {
            //c!=0
            let i1 = i - 1 - c;
            let i2 = i - 1;
            c = 0;
            //console.log("i:" + i,"switch - " + i1 + "to" + i2);
            result.inverse(i1, i2);
        }
        //console.log("i:" + i, "old:" + oldDate + "/" + oldMonth + "<br/>" + "new:" + newDate + "/" + newMonth + "<br/> c:" + c);
        oldDate = newDate;
        oldMonth = newMonth;
    }
    if (c != 0) {
        let i1 = i - 1 - c;
        let i2 = i - 1;
        result.inverse(i1, i2);
        //console.log("switch",i1, i2);
    }
    return result;
}

function popUpYear(container, txt) {
    let c = div(container);
    c.className = 'PopUpYear';
    div(c);
    let inner = div(c);
    inner.innerHTML = txt;
    let nbr = div(div(c));

    return nbr;
}

function popUpMonth(container, txt) {
    let c = div(container);
    c.className = 'PopUpMonth';
    div(c);
    let inner = div(c);
    inner.innerHTML = txt;
    let nbr = div(div(c));

    return nbr;
}

function popUpDay(container, txt) {
    let c = div(container);
    c.className = 'PopUpDay';

    let infos = div(c);

    div(infos);
    let inner = div(infos);
    inner.innerHTML = txt;
    let nbr = div(div(infos));

    return nbr;
}
