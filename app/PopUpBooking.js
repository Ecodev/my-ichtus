function popBooking(bookingId) {
    var elem = openPopUp();
    Requests.getBookingInfos(bookingId, elem);
    loadConfirmation(elem);
}
function loadConfirmation(elem = $('divTabCahierConfirmation')) {

    var fields = ["Responsable", "Heure de départ", "Embarcation", "Nbr de participants", "Destination", "Commentaire dép.", "Commentaire arr."];

    var container;
    container = div(elem);
    container.style.position = "absolute";
    container.style.top = "50%";
    container.style.marginLeft = "0px";
    container.style.left = "50%";
    container.style.transform = "translate(-50%,-50%)";

    container.className = "divTabCahierConfirmationContainer";

    container.innerHTML += '<div style=" font-size:25px; text-align:center; color:black;">Votre sortie</div>';
    grayBar(container, 5);

    for (var i = 0; i < 2; i++) {
        var d = div(container);
        d.classList.add("divConfirmationTexts");
        div(div(d));
        div(d).innerHTML = fields[i];
        div(d);
        if (i == 1 && elem != "tab") {
            d = div(container);
            d.classList.add("divConfirmationTexts");
            div(div(d));
            div(d).innerHTML = "Heure d'arrivée";
            div(d);
        }
    }

    grayBar(container);

    d = div(container);
    d.classList.add("divConfirmationTexts");
    d.style.backgroundColor = "rgb(235,235,235)";
    div(div(d));
    div(d).innerHTML = fields[2];
    div(d);

    var emb = div(container);
    emb.className = "divTabCahierConfirmationEmbarcationBox";
    div(div(emb));

    var texts = div(emb);
    texts.className = "divTabCahierConfirmationContainerTextsContainer";
    div(texts).innerHTML = "TITLE";
    div(texts).innerHTML = "n2";

    grayBar(container);

    for (var i = 3; i < 6; i++) {
        d = div(container);
        d.classList.add("divConfirmationTexts");
        div(div(d));
        div(d).innerHTML = fields[i];
        div(d);
    }


    d = div(container);
    d.classList.add("divConfirmationTexts");
    div(div(d));
    div(d).innerHTML = fields[6];
    div(d);

    var close = div(container);
    close.className = "divPopUpClose";
    close.onclick = function () {
        closePopUp({ target: elem }, elem);
    };
}


function actualizePopBooking(booking, container = $('divTabCahierConfirmationContainer')) {
    var allDiv = container.getElementsByClassName("divConfirmationTexts");
    var allDivTexts = [];
    var allDivIcons = [];
    for (var i = 0; i < allDiv.length; i++) {
        allDivIcons[i] = allDiv[i].getElementsByTagName("div")[0].getElementsByTagName("div")[0];
        allDivTexts[i] = allDiv[i].getElementsByTagName('div')[3];
    }


    container.getElementsByClassName('divTabCahierConfirmationContainer')[0].getElementsByTagName("div")[0].innerHTML = "Sortie du " + (new Date(booking.startDate)).getNiceDate();

    container.getElementsByClassName('divTabCahierConfirmationEmbarcationBox')[0].getElementsByTagName("div")[0].addEventListener("click", function () { popBookable(booking.bookables[0].id); });


    if (booking.responsible != null) {
        allDivTexts[0].innerHTML = booking.responsible.name;
    }
    else {
        allDivTexts[0].innerHTML = "Invité";
    }

    //allDivIcons[0].style.backgroundImage = "url(Img/Icon" + booking.responsible.gender + ".png)";

    allDivTexts[1].innerHTML = (new Date(booking.startDate)).getNiceTime();
    allDivIcons[1].style.backgroundImage = "";

    if (booking.endDate == null) {
        allDivTexts[2].innerHTML = "Pas encore rentré(e)";
    }
    else {
        allDivTexts[2].innerHTML = (new Date(booking.endDate)).getNiceTime();
    }

    container.getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[0].innerHTML = booking.bookables[0].name;
    container.getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[1].innerHTML = booking.bookables[0].code;

    allDivTexts[4].innerHTML = Cahier.getNbrAccompagnantsText(booking.participantCount, " Participant");
    allDivIcons[4].style.backgroundImage = "url(Img/IconInvitesTransparent.png)";
    allDivTexts[5].innerHTML = booking.destination;
    allDivIcons[5].style.backgroundImage = "url(Img/IconDestinationBlack.png)";

    allDivTexts[6].innerHTML = Cahier.getStartCommentText(booking.startComment);
    allDivTexts[7].innerHTML = Cahier.getStartCommentText(booking.endComment);
}

