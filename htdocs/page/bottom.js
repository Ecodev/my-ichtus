import {deleteObjects, div, options} from '../general/home.js';
import {Requests} from '../general/server-requests.js';
import {popStats} from './pop-stats.js';

export function loadBottoms() {
    const allDivTabs = document.getElementsByClassName('divTab');

    while (document.getElementsByClassName('divSpacers').length !== 0) {
        deleteObjects(document.getElementsByClassName('divSpacers')[0]);
    }
    while (document.getElementsByClassName('divBottoms').length !== 0) {
        deleteObjects(document.getElementsByClassName('divBottoms')[0]);
    }

    // new bars
    for (let i = 0; i < allDivTabs.length; i++) {
        const s = div(allDivTabs[i]);
        s.className = 'divSpacers';

        const b = div(allDivTabs[i]);
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
        for (let j = 0; j < all.length; j++) {
            all[j].children[0].innerHTML = 'Voir les statistiques du mois';
        }
    }
}
