function popBookableHistory(bookableId) {

    var modal = openPopUp();

    Requests.getBookableHistory(bookableId, modal);

    var container;
    container = div(modal);
    container.classList.add("Boxes");
    container.style.position = "absolute";
    container.style.width = "700px";
    container.style.top = "50%";
    container.style.marginLeft = "0px";
    container.style.left = "50%";
    container.style.transform = "translate(-50%,-50%)";
    container.style.padding = "10px";
    container.classList.add("PopUpBookableHistoryContainer");

    container.innerHTML += '<div style=" font-size:25px; text-align:center; color:black;">Historique</div>';
    container.innerHTML += '<div style="background-color:gray; height:2px; margin-bottom:5px;  margin-top:5px; border-radius:2px;"></div>';

    var close = div(container);
    close.className = "divPopUpClose";
    close.onclick = function () {
        closePopUp({ target: modal }, modal);
    };










}


Array.prototype.switch = function (i1, i2) {
    var content_i1 = this[i1];
    this.splice(i1, 1, this[i2]);
    this.splice(i2, 1, content_i1);
    return this;
};

Array.prototype.inverse = function (i1, i2) {
    for (var i = i1; i < parseInt((i1+i2) / 2+0.5); i++) {
        this.switch(i, i1+i2-i);
    }
    return this;
};

//var a = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];


function changeDaySorting(bookings) {

    var oldDate = (new Date(bookings[0].startDate)).getDate();
    var oldMonth = (new Date(bookings[0].startDate)).getMonth();

    var result = bookings;

    var c = 0;
    for (var i = 1; i < result.length; i++) {
        var newDate = (new Date(result[i].startDate)).getDate();
        var newMonth = (new Date(result[i].startDate)).getMonth();
        if (oldDate == newDate && oldMonth == newMonth) {
            c++;
            console.log("i:" + i, "c++");
        }
        else if (c!= 0) { //c!=0
            var i1 = i - 1 - c;
            var i2 = i - 1;
            c = 0;
            console.log("i:" + i,"switch - " + i1 + "to" + i2);
            result.inverse(i1, i2);
        }
        console.log("i:" + i, "old:" + oldDate + "/" + oldMonth + "<br/>" + "new:" + newDate + "/" + newMonth + "<br/> c:" + c); 
        oldDate = newDate;
        oldMonth = newMonth;
       
    }
    if (c != 0) {
        var i1 = i - 1 - c;
        var i2 = i - 1;
        result.inverse(i1, i2);
        console.log("switch",i1, i2);
    }
    return result;
}

function actualizePopBookableHistory(bookings, elem) {

    bookings = changeDaySorting(bookings); 

    console.log(bookings);

    var bookableId = bookings[0].bookables[0].id;

    var container = elem.getElementsByTagName("div")[0];
    container.getElementsByTagName("div")[0].innerHTML = "Historique de ->nom" + bookableId;

    var scroll = div(container);
    scroll.className = "PopUpBookableHistoryContainerScroll";

    var currentYear = -1;
    var currentMonth = .1;
    var currentDay = -1;

    for (var i = 0; i < bookings.length; i++) {

        var d = new Date(bookings[i].startDate);

        var newYear = d.getFullYear();
        if (newYear != currentYear) {
            var year = popUpYear(scroll, newYear);

            var start = new Date(d.getFullYear(), 0, 0, 0, 0, 1);
            var end = new Date(d.getFullYear()+1, 0, 1, 0, 0, 0, 1);
            Requests.getBookingsNbrBetween(start.toISOString(), end.toISOString(), bookableId, year);
        }

        var newMonth = d.getMonth();
        if (newMonth != currentMonth || newYear != currentYear) {
            var month = popUpMonth(scroll, Mois[newMonth]);

            var start = new Date(d.getFullYear(), newMonth, 1, 0, 0, 0, 1);
            var end = new Date(d.getFullYear(), newMonth + 1, 1, 0, 0, 0, 1);
            Requests.getBookingsNbrBetween(start.toISOString(), end.toISOString(), bookableId, month);
        }

        var newDay = d.getDate();
        if (newDay != currentDay || newMonth != currentMonth || newYear != currentYear) {         
            popUpDay(scroll, Jours[d.getDay()] + " " + newDay + " " + Mois[newMonth]);
        }

        currentYear = newYear;
        currentMonth = newMonth;
        currentDay = newDay;

        var time = div(scroll);
        time.className = "PopUpTime";
        time.innerHTML = d.getHours() + ":" + TimeGetMinutes(d.getMinutes()) + "   " + bookings[i].id;


    }
}


function popUpYear(container,txt) {
    var c = div(container);
    c.className = "PopUpYear";
    div(c);
    var inner = div(c);
    inner.innerHTML = txt;
    var nbr = div(div(c));
      
    return nbr;
}


function popUpMonth(container, txt) {
    var c = div(container);
    c.className = "PopUpMonth";
    div(c);
    var inner = div(c);
    inner.innerHTML = txt;
    var nbr = div(div(c));

    return nbr;
}


function popUpDay(container, txt) {
    var c = div(container);
    c.className = "PopUpDay";
    div(c);
    var inner = div(c);
    inner.innerHTML = txt;
}