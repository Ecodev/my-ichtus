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

function actualizePopBookableHistory(bookings, elem) {

    var bookableId = bookings[0].bookables[0].id;

    var container = elem.getElementsByTagName("div")[0];
    container.getElementsByTagName("div")[0].innerHTML = "Historique de ->nom" + bookableId;

    var scroll = div(container);
    scroll.className = "PopUpBookableHistoryContainerScroll";


    var currentMonth = 99;
    var currentDay = 99;
    for (var i = 0; i < bookings.length; i++) {

        var d = new Date(bookings[i].startDate);

        var newMonth = d.getMonth();
        if (newMonth != currentMonth) {
            var month = div(scroll);
            month.className = "PopUpMonth";
            month.innerHTML = Mois[newMonth];  

            var start = new Date(d.getFullYear(), newMonth, 1, 0, 0, 0, 1);
            var end = new Date(d.getFullYear(), newMonth + 1, 1, 0, 0, 0, 1);
            Requests.getBookingsNbrBetween(start.toISOString(), end.toISOString(), bookableId, month);
        }

        var newDay = d.getDate();
        if (newDay != currentDay || newMonth != currentMonth) {         
            var day = div(scroll);
            day.className = "PopUpDay";
            day.innerHTML = Jours[d.getDay()] + " " + newDay + " " + Mois[newMonth];

            var start = new Date(d.getFullYear(), newMonth, newDay, 0, 0, 0, 1);
            var end = new Date(d.getFullYear(), newMonth , newDay + 1, 0, 0, 0, 1);
            Requests.getBookingsNbrBetween(start.toISOString(), end.toISOString(), bookableId, day);
        }

        while (newDay == currentDay) {

        }

        currentMonth = newMonth;
        currentDay = newDay;

        var time = div(scroll);
        time.className = "PopUpTime";
        time.innerHTML = d.getHours() + ":" + TimeGetMinutes(d.getMinutes());
    }
}