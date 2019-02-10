function popBooking(bookingId) {
    var elem = openPopUp();
    Requests.getBookingInfos(bookingId, elem);
    loadConfirmation(elem);
}
function loadConfirmation(elem = $('divTabCahierConfirmation')) {

    var fields = ["Responsable", "Heure de départ", "Embarcation", "Nbr de participants", "Destination", "Commentaire dép.", "Commentaire arr."];
    var images = ["IconResponsible", "IconStart",  "IconSail","IconParticipantCount", "IconDestination", "IconStartComment", "IconEndComment"];

    var container;

    if (elem != $('divTabCahierConfirmation')) {
        container = div(elem);
        container.style.position = "absolute";
        container.style.top = "50%";
        container.style.marginLeft = "0px";
        container.style.left = "50%";
        container.style.transform = "translate(-50%,-50%)";
    }
    else {
        container = document.createElement("div");
        elem.insertBefore(container, elem.getElementsByClassName("ValidateButtons")[0].parentElement);
        container.style.position = "relative";
        container.style.minHeight = "10px";
    }

    container.className = "divTabCahierConfirmationContainer";

    container.innerHTML += '<div style=" font-size:25px; text-align:center; color:black;">Votre sortie</div>';
    grayBar(container, 5);

    for (var i = 0; i < 2; i++) {
        var d = div(container);
        d.classList.add("divConfirmationTexts");
        div(div(d)).style.backgroundImage = "url(Img/" + images[i] + ".png)";
        div(d).innerHTML = fields[i];
        div(d);
        if (i == 1 && elem != $('divTabCahierConfirmation')) {
            d = div(container);
            d.classList.add("divConfirmationTexts");
            div(div(d)).style.backgroundImage = "url(Img/" + "IconEnd" + ".png)";
            div(d).innerHTML = "Heure d'arrivée";
            div(d);
        }
    }

    grayBar(container);

    d = div(container);
    d.classList.add("divConfirmationTexts");
    d.style.backgroundColor = "rgb(235,235,235)";
    div(div(d)).style.backgroundImage = "url(Img/" + images[2] + ".png)";
    div(d).innerHTML = fields[2];
    div(d);

    var emb = div(container);
    emb.className = "divTabCahierConfirmationEmbarcationBox";
    div(div(emb));

    var texts = div(emb);
    texts.className = "divTabCahierConfirmationContainerTextsContainer";
    div(texts).innerHTML = "...";
    div(texts).innerHTML = "...";

    grayBar(container);

    for (var i = 3; i < 6; i++) {
        d = div(container);
        d.classList.add("divConfirmationTexts");
        div(div(d)).style.backgroundImage = "url(Img/" + images[i] + ".png)";
        div(d).innerHTML = fields[i];
        div(d);
        if (elem == $('divTabCahierConfirmation')) {
            if (i / 2 == Math.floor(i / 2)) {
                d.style.backgroundColor = "white";
            }
            else {
                d.style.backgroundColor = "rgb(235,235,235)";
            }
        }
    }

    if (elem != $('divTabCahierConfirmation')) {
        d = div(container);
        d.classList.add("divConfirmationTexts");
        div(div(d)).style.backgroundImage = "url(Img/" + images[6] + ".png)";
        div(d).innerHTML = fields[6];
        div(d);

        var close = div(container);
        close.className = "divPopUpClose";
        close.onclick = function () {
            closePopUp({ target: elem }, elem);
        };
    }
    else {
        var btn = div(emb);
        btn.innerHTML = "Modifier";
        btn.classList.add("Buttons");
        btn.classList.add("ReturnButtons");
        btn.onclick = function () { newTab('divTabCahierMaterielCategories'); };

       
        var bar = div(container);
        bar.classList.add("divConfirmationTexts");
        bar.style.height = "50px";
        bar.style.backgroundColor = "white";
        div(bar);
        div(bar);
        var u = div(bar);
        u.style.height = "100%";
        var btn2 = div(u);
        btn2.innerHTML = "Modifier";
        btn2.classList.add("Buttons");
        btn2.classList.add("ReturnButtons");
        btn2.onclick = function () { newTab('divTabCahierInfos'); };
    }
}




function actualizePopBooking(booking, container = $('divTabCahierConfirmationContainer')) {
    var allDiv = container.getElementsByClassName("divConfirmationTexts");
    var allDivTexts = [];
    for (var i = 0; i < allDiv.length; i++) {
        allDivTexts[i] = allDiv[i].getElementsByTagName('div')[3];
    }

    container.getElementsByClassName('divTabCahierConfirmationContainer')[0].getElementsByTagName("div")[0].innerHTML = "Sortie du " + (new Date(booking.startDate)).getNiceDate(false,true);

    allDivTexts[0].innerHTML = getownerNameFromBooking(booking, true, { length: 1000000, fontSize: 35 });

    allDivTexts[1].innerHTML = (new Date(booking.startDate)).getNiceTime();

    if (booking.endDate == null) {
        allDivTexts[2].innerHTML = "Pas encore rentré(e)";
    }
    else {
        allDivTexts[2].innerHTML = (new Date(booking.endDate)).getNiceTime();
    }

    if (booking.bookables.length != 0) {
        container.getElementsByClassName('divTabCahierConfirmationEmbarcationBox')[0].getElementsByTagName("div")[0].addEventListener("click", function () { popBookable(booking.bookables[0].id); });
        container.getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[0].innerHTML = booking.bookables[0].name;
        container.getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[1].innerHTML = booking.bookables[0].code + " caté";
    }
    else {
        container.getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[0].innerHTML = "Matériel personel";
        container.getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[1].innerHTML = "";
        container.getElementsByClassName('divTabCahierConfirmationEmbarcationBox')[0].getElementsByTagName("div")[0].style.visibility =  "hidden";
    }

    allDivTexts[4].innerHTML = Cahier.getnbrParticipantsText(booking.participantCount, " Participant");
    allDivTexts[5].innerHTML = booking.destination;

    allDivTexts[6].innerHTML = getStartCommentFromBooking(booking,true);
    allDivTexts[7].innerHTML = getEndCommentFromBooking(booking,true);
}













function createConfirmationBooking(booking, nbr, owner = "michel", participantCount = 4, destination = "Baie", startComment = "Bonsoir j'adore voyager askfjalskdfjaésldkfj", bookableId = 3001, bookableName = "Canoé wesh 123456789", bookableCodeAndCategory = "Canoé - C32 123456789") {
    var fields = [Cahier.getFullName(booking), Cahier.getnbrParticipantsText(booking.participantCount), booking.destination, booking.startComment.shorten(295, 25), "Embarcation"];
    var images = ["IconResponsible", "IconParticipantCount", "IconDestination", "IconStartComment","IconSail"];

    var container = div($('divTabConfirmationBookingsContainer'));
    container.style.position = "relative";
    container.style.minHeight = "10px";
    container.classList.add("divTabCahierConfirmationContainer");
    container.classList.add("confirmationTab");

    container.innerHTML += '<div style=" font-size:25px; text-align:center; color:black;">Votre sortie</div>';
    grayBar(container, 5,10);

    for (var i = 0; i < 4; i++) {
        var d = div(container);
        d.classList.add("divConfirmationTexts");
        d.classList.add("confirmationTab");
        div(div(d)).style.backgroundImage = "url(Img/" + images[i] + ".png)";
        div(d).innerHTML = fields[i];
        if (i == 0) {
            var a = div(d);
            var btn = div(a);
            btn.innerHTML = "Changer le responsable";
            btn.classList.add("Buttons");
            btn.classList.add("ReturnButtons");
            btn.onclick = function () { newTab('divTabCahierMaterielCategories'); };
        }
    }

    var embarcationContainer = div(container);
    embarcationContainer.classList.add("divTabCahierConfirmationEmbarcationBoxContainer");
    embarcationContainer.classList.add("confirmationTab");

    d = div(embarcationContainer);
    d.classList.add("divConfirmationTexts");
    d.classList.add("confirmationTab");
    d.style.backgroundColor = "rgb(235,235,235)";
    div(div(d)).style.backgroundImage = "url(Img/" + images[4] + ".png)";
    div(d).innerHTML = fields[4];

    var emb = div(embarcationContainer);
    emb.classList.add("divTabCahierConfirmationEmbarcationBox");
    emb.classList.add("confirmationTab");
    div(div(emb));

    container.getElementsByClassName('divTabCahierConfirmationEmbarcationBox')[0].getElementsByTagName("div")[0].addEventListener("click", function () { popBookable(bookableId); });

    var texts = div(emb);
    texts.className = "divTabCahierConfirmationContainerTextsContainer";
    div(texts).innerHTML = booking.bookables[0].name.shorten(180,25);
    div(texts).innerHTML = booking.bookables[0].code.shorten(180,20);


    var btn = div(container);
    btn.innerHTML = "Modifier";
    btn.classList.add("Buttons");
    btn.classList.add("ReturnButtons");
    btn.onclick = function () { newTab('divTabCahierMaterielCategories'); };

    var btn = div(emb);
    btn.innerHTML = "Modifier";
    btn.classList.add("Buttons");
    btn.classList.add("ReturnButtons");
    btn.onclick = function () { newTab('divTabCahierMaterielCategories'); };    

    var r = div(container);
    r.classList.add("divTabCahierConfirmationDeleteBooking");

}