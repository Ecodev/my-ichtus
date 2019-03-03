function popStats() {

    var elem = openPopUp();

    var container;
    container = div(elem);
    container.classList.add("PopUpStatsContainer");
    container.classList.add("Boxes");

    var close = div(container);
    close.className = "divPopUpClose";
    close.onclick = function () {
        closePopUp({ target: elem }, elem);
    };

    var d = div(container);
    d.style.textAlign = "center";
    d.style.fontSize = "25px";
    d.innerHTML = "Statistiques";

    grayBar(container, 5);

    var c = div(container);
    c.classList.add("divStatsContainer");

    var scale = div(c);
    var center = div(c);
    var legend = div(c);

    div(scale);
    div(scale);
    div(scale).innerHTML = 0;

    div(legend);
    div(legend);

    var end = new Date();
    var start = new Date(end.getFullYear(), end.getMonth()-1, 1, 0, 0, 0, 1);
    Requests.getMonthlyBookingsNbr(start, end);

    Requests.getStats(start,end,c);
}

function actualizeStats(start, end, elem, bookings) {

    var stats = [];

    var elapsedTime = Math.abs(end.getTime() - start.getTime());
    var daysNbr = parseInt(elapsedTime / (1000 * 3600 * 24)); 
    for (var i = 0; i < daysNbr+1; i++) {
        stats.push(0);
    }


    for (var i = 0; i < bookings.length; i++) {
        var date = new Date(bookings[i].startDate);

        var elapsedTime = Math.abs(date.getTime() - start.getTime());
        var daysNbr = parseInt(elapsedTime / (1000 * 3600 * 24)); 

        stats[daysNbr]++;
    }



    var scale = elem.children[0];
    var center = elem.children[1];
    var legend = elem.children[2];

  //  var stats = [25, 34, 100, 7, 100, 9, 25, 100, 7, 100, 9, 25, 100];

    var legends = Jours.concat(Jours).concat(Jours);
   // var stats = [25, 34, 100, 7, 100, 9, 25, 100, 7, 100, 9, 25, 100]
    var max = stats.max();

    for (var i = 0; i < stats.length; i++) {
        var d = div(center);
        d.style.width = 100 / stats.length * 0.8 + "%";
        d.style.marginLeft = 100 / stats.length * 0.1 + "%";
        d.style.marginRight = 100 / stats.length * 0.1 + "%";

        var bar = div(d);
        bar.style.height = stats[i] / max * 90 + "%";

        var nbr = div(d);
        nbr.innerHTML = stats[i];

        var l = div(legend);
        l.style.width = 100 / stats.length * 1 + "%";

        var date = new Date(start);
        date.setDate(start.getDate() + i);

        l.innerHTML = date.getDate();
    }



    var step = 1;
    var count = (max - max % step) / step;

    while (count > 8) {
        if (step.toString().indexOf("1") != -1) {
            step = step * 2.5;
        }
        else if (step.toString().indexOf("2") != -1) {
            step = step * 2;
        }
        else if (step.toString().indexOf("5") != -1) {
            step = step * 2;
        }
        count = (max - max % step) / step;
    }

    for (var i = 1; i < count + 1; i++) {
        var s = div(scale);
        s.style.top = 100 - i * step / max * 90 + "%";
        s.innerHTML = i * step;
        div(s);
        div(s);
    }

}

Array.prototype.max = function () {
    var m = this[0];
    for (var i = 1; i < this.length; i++) {
        if (this[i] > m) {
            m = this[i];
        }
    }
    return m;
};