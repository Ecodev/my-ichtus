import {deleteElements, div, options} from '../general/home';
import {Requests} from '../general/server-requests';
import {popStats} from './pop-stats';

export function loadBottoms(): void {
    const allDivTabs = document.getElementsByClassName('divTab');

    while (document.getElementsByClassName('divSpacers').length !== 0) {
        deleteElements(document.getElementsByClassName('divSpacers')[0]);
    }
    while (document.getElementsByClassName('divBottoms').length !== 0) {
        deleteElements(document.getElementsByClassName('divBottoms')[0]);
    }

    // new bars
    for (const elem of allDivTabs) {
        const s = div(elem);
        s.className = 'divSpacers';

        const b = div(elem);
        b.className = 'divBottoms';

        const divMonth = div(b);
        divMonth.onclick = function () {
            popStats();
        };
    }

    if (options.statsButtonTextActive) {
        const end = new Date(Date.now());
        const start = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0, 1);

        Requests.getMonthlyBookingsNbr(start, end);
    } else {
        const all = document.getElementsByClassName('divBottoms');
        for (const elem of all) {
            elem.children[0].innerHTML = 'Voir les statistiques du mois';
        }
    }
}
