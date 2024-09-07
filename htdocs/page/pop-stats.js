function popStats() {
    let elem = openPopUp();

    let container;
    container = div(elem);
    container.classList.add('PopUpStatsContainer');
    container.classList.add('Boxes');

    let close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem}, elem);
    };

    let d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = 'Statistiques';

    grayBar(container, 5);

    div(container).innerHTML = 'Sorties';
    div(container).innerHTML = 'Jour';

    let t = div(container);
    t.classList.add('PopUpStatsContainerTitle');

    div(t);

    let c = div(container);
    c.classList.add('divStatsContainer');

    loadStats();
}

function loadStats(end = new Date()) {
    let start = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0, 1);

    let t = document.getElementsByClassName('PopUpStatsContainerTitle')[0];
    t.innerHTML = '';
    let btn = div(t);
    btn.onclick = function () {
        loadStats(new Date(start.getFullYear(), start.getMonth(), 0, 23, 59, 59, 99)); // day 0
    };

    let btn2 = div(t);
    if (new Date(end.getFullYear(), end.getMonth() + 1, 0, 0, 0, 0, 1) > new Date()) {
        btn2.style.visibility = 'hidden';
    } else {
        btn2.onclick = function () {
            loadStats(new Date(start.getFullYear(), start.getMonth() + 2, 0, 23, 59, 59, 99)); // day 0
        };
    }

    div(t).innerHTML = Mois[start.getMonth()];

    let c = document.getElementsByClassName('divStatsContainer')[0];
    c.innerHTML = '';

    let scale = div(c);
    let center = div(c);
    let legend = div(c);

    div(scale);
    div(scale);
    div(scale).innerHTML = 0;

    div(legend);
    div(legend);

    Requests.getStats(start, end, c);
}

function actualizeStats(start, end, elem, bookings) {
    let stats = [];

    var elapsedTime = Math.abs(end.getTime() - start.getTime());
    var daysNbr = parseInt(elapsedTime / (1000 * 3600 * 24));
    for (var i = 0; i < daysNbr + 1; i++) {
        stats.push(0);
    }

    for (var i = 0; i < bookings.length; i++) {
        var date = new Date(bookings[i].startDate);

        var elapsedTime = Math.abs(date.getTime() - start.getTime());
        var daysNbr = parseInt(elapsedTime / (1000 * 3600 * 24));

        stats[daysNbr]++;
    }

    div(elem.parentElement.getElementsByClassName('PopUpStatsContainerTitle')[0]).innerHTML =
        Cahier.getSingularOrPlural(bookings.length, ' sortie');

    let scale = elem.children[0];
    let center = elem.children[1];
    let legend = elem.children[2];

    let legends = Jours.concat(Jours).concat(Jours);
    let max = stats.max();

    for (var i = 0; i < stats.length; i++) {
        let d = div(center);
        d.style.width = 100 / stats.length + '%';

        let bar = div(d);
        bar.style.height = (stats[i] / max) * 90 + '%';

        let nbr = div(d);
        nbr.innerHTML = stats[i];

        let l = div(legend);
        l.style.width = 100 / stats.length + '%';

        if (i % parseInt(stats.length / 10) == 0 || stats.length / 10 < 1) {
            var date = new Date(start);
            date.setDate(start.getDate() + i);

            div(l).innerHTML = date.getDate();
        }
    }

    let step = 1;
    let count = (max - (max % step)) / step;

    while (count > 8) {
        if (step.toString().indexOf('1') != -1) {
            step = step * 2.5;
        } else if (step.toString().indexOf('2') != -1) {
            step = step * 2;
        } else if (step.toString().indexOf('5') != -1) {
            step = step * 2;
        }
        count = (max - (max % step)) / step;
    }

    for (var i = 1; i < count + 1; i++) {
        let s = div(scale);
        s.style.top = 100 - ((i * step) / max) * 90 + '%';
        s.innerHTML = i * step;
        div(s);
        div(s);
    }
}

Array.prototype.max = function () {
    let m = this[0];
    for (let i = 1; i < this.length; i++) {
        if (this[i] > m) {
            m = this[i];
        }
    }
    return m;
};
