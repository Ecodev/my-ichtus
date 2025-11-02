import {closePopUp, div, grayBar, Mois, openPopUp} from '../general/home';
import {type Booking, Requests} from '../general/server-requests';
import {Cahier} from '../cahier/methods';

export function popStats(): void {
    const elem = openPopUp();

    const container = div(elem);
    container.classList.add('PopUpStatsContainer');
    container.classList.add('Boxes');

    const close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem});
    };

    const d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = 'Statistiques';

    grayBar(container, 5);

    div(container).innerHTML = 'Sorties';
    div(container).innerHTML = 'Jour';

    const t = div(container);
    t.classList.add('PopUpStatsContainerTitle');

    div(t);

    const c = div(container);
    c.classList.add('divStatsContainer');

    loadStats();
}

function loadStats(end = new Date()): void {
    const start = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0, 1);

    const t = document.getElementsByClassName('PopUpStatsContainerTitle')[0];
    t.innerHTML = '';
    const btn = div(t);
    btn.onclick = function () {
        loadStats(new Date(start.getFullYear(), start.getMonth(), 0, 23, 59, 59, 99)); // day 0
    };

    const btn2 = div(t);
    if (new Date(end.getFullYear(), end.getMonth() + 1, 0, 0, 0, 0, 1) > new Date()) {
        btn2.style.visibility = 'hidden';
    } else {
        btn2.onclick = function () {
            loadStats(new Date(start.getFullYear(), start.getMonth() + 2, 0, 23, 59, 59, 99)); // day 0
        };
    }

    div(t).innerHTML = Mois[start.getMonth()];

    const c = document.getElementsByClassName('divStatsContainer')[0];
    c.innerHTML = '';

    const scale = div(c);
    div(c); // center
    const legend = div(c);

    div(scale);
    div(scale);
    div(scale).innerHTML = '0';

    div(legend);
    div(legend);

    Requests.getStats(start, end, c);
}

export function actualizeStats(start: Date, end: Date, elem: Element, bookings: Booking[]): void {
    const stats = [];

    const elapsedTime = Math.abs(end.getTime() - start.getTime());
    const daysNbr = parseInt('' + elapsedTime / (1000 * 3600 * 24));
    for (let i = 0; i < daysNbr + 1; i++) {
        stats.push(0);
    }

    for (const item of bookings) {
        const date = new Date(item.startDate);

        const elapsedTime = Math.abs(date.getTime() - start.getTime());
        const daysNbr = parseInt('' + elapsedTime / (1000 * 3600 * 24));

        stats[daysNbr]++;
    }

    div(elem.parentElement!.getElementsByClassName('PopUpStatsContainerTitle')[0]).innerHTML =
        Cahier.getSingularOrPlural(bookings.length, ' sortie');

    const scale = elem.children[0];
    const center = elem.children[1];
    const legend = elem.children[2];

    const max = maxValue(stats);

    for (let i = 0; i < stats.length; i++) {
        const d = div(center);
        d.style.width = 100 / stats.length + '%';

        const bar = div(d);
        bar.style.height = (stats[i] / max) * 90 + '%';

        const nbr = div(d);
        nbr.innerHTML = '' + stats[i];

        const l = div(legend);
        l.style.width = 100 / stats.length + '%';

        if (i % parseInt('' + stats.length / 10) == 0 || stats.length / 10 < 1) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);

            div(l).innerHTML = '' + date.getDate();
        }
    }

    let step = 1;
    let count = (max - (max % step)) / step;

    while (count > 8) {
        if (step.toString().includes('1')) {
            step = step * 2.5;
        } else if (step.toString().includes('2')) {
            step = step * 2;
        } else if (step.toString().includes('5')) {
            step = step * 2;
        }
        count = (max - (max % step)) / step;
    }

    for (let i = 1; i < count + 1; i++) {
        const s = div(scale);
        s.style.top = 100 - ((i * step) / max) * 90 + '%';
        s.innerHTML = '' + i * step;
        div(s);
        div(s);
    }
}

function maxValue(values: number[]): number {
    let m = values[0];
    for (let i = 1; i < values.length; i++) {
        if (values[i] > m) {
            m = values[i];
        }
    }
    return m;
}
