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
    var container = elem.getElementsByTagName("div")[0];

    var scroll = div(container);
    scroll.className = "PopUpBookableHistoryContainerScroll";

    var date = new Date(bookings[0].startDate);

    var month = div(scroll);
    month.className = "PopUpMonth";
    month.innerHTML = Mois[date.getMonth()];

    var day = div(scroll);
    day.className = "PopUpDay";
    day.innerHTML = Jours[date.getDay()] + " " + date.getDate() + " " + Mois[date.getMonth()];

    Requests.getBookingsNbrBetween("2018-01-01T14:15:00+01:00", "2018-12-31T23:59:00+01:00");

    div(scroll).innerHTML =  "<br/>" + bookings[0].startDate;


}