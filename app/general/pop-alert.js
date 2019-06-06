function popAlert(txt = "haha ahah ahah ") {

    var elem = openPopUp();

    var container;
    container = div(elem);
    container.classList.add("PopUpAlertContainer");
    container.classList.add("Boxes");

    var close = div(container);
    close.className = "divPopUpClose";
    close.onclick = function () {
        closePopUp({ target: elem }, elem);
    };

    var d = div(container);
    d.style.textAlign = "center";
    d.style.fontSize = "25px";
    d.innerHTML = "!";

    grayBar(container, 5);

    var t = div(container);
    t.innerHTML = txt;
}

function popAlertAlreadyHavingABooking(_owner) {
    var elem = openPopUp();

    var container;
    container = div(elem);
    container.classList.add("PopUpAlertContainer","booking");
    container.classList.add("Boxes");

    var close = div(container);
    close.className = "divPopUpClose";
    close.onclick = function () {
        closePopUp({ target: elem }, elem);
    };

    var d = div(container);
    d.style.textAlign = "center";
    d.style.fontSize = "25px";
    d.innerHTML = "!";

    grayBar(container, 5);

    var t = div(container);
    t.innerHTML = "Il semblerait que vous ayiez déjà une sortie en cours";

    var btnContainer = div(container);
    btnContainer.style.position = "relative";
    btnContainer.style.textAlign = "center";

    var btn = div(btnContainer);
    btn.classList.add("Buttons");
    btn.style.display = "inline-block";
    btn.innerHTML = "Voir les sorties";
    btn.addEventListener("click", function () { newTab("divTabCahier"); closePopUp("last"); });

    btn = div(btnContainer);
    btn.classList.add("Buttons", "ValidateButtons");
    btn.style.display = "inline-block";
    btn.innerHTML = "Continuer";
    btn.addEventListener("click", function () { Cahier.setOwner(0, _owner,true); closePopUp("last"); });
}


function popAlertMoreBookablesThanParticipants(bookables,participants) {
    var elem = openPopUp();

    var container;
    container = div(elem);
    container.classList.add("PopUpAlertContainer", "bookable");
    container.classList.add("Boxes");

    var close = div(container);
    close.className = "divPopUpClose";
    close.onclick = function () {
        closePopUp({ target: elem }, elem);
    };

    var d = div(container);
    d.style.textAlign = "center";
    d.style.fontSize = "25px";
    d.innerHTML = "Trop d'embarcations";

    grayBar(container, 5);

    var t = div(container);
    t.innerHTML = "Vous avez choisi " + bookables + " embarcations pour seulement " + Cahier.getSingularOrPlural(participants, " participant") + " !";

    var btnContainer = div(container);
    btnContainer.style.position = "relative";
    btnContainer.style.textAlign = "center";

    var btn = div(btnContainer);
    btn.classList.add("Buttons","ValidateButtons");
    btn.style.display = "inline-block";
    btn.innerHTML = "Modifier le nbr de participants";
    btn.addEventListener("click", function () { closePopUp("last"); popCahierInfos(0);  });
}


function popAlertBookablesNotAvailable() {
    var elem = openPopUp();

    var container;
    container = div(elem);
    container.classList.add("PopUpAlertContainer", "available");
    container.classList.add("Boxes");

    var close = div(container);
    close.className = "divPopUpClose";
    close.onclick = function () {
        closePopUp({ target: elem }, elem);
    };

    var d = div(container);
    d.style.textAlign = "center";
    d.style.fontSize = "25px";
    d.innerHTML = "<img src='img/icons/alert.png' style='display: inline-block; vertical-align: middle; width:30px;'/> Embarcations déjà utilisées";

    grayBar(container, 5);


    var bookablesNotAvailable = [];
    for (var i = 0; i < Cahier.bookings[0].bookables.length; i++) {
        if (Cahier.bookings[0].bookables[i].available === false) {
            bookablesNotAvailable.push(Cahier.bookings[0].bookables[i]);
        }
    }

    var nU, nV;
    var bookingsToFinish = [];

    for (var k = 0; k < bookablesNotAvailable.length; k++) {

        for (var u = 0; u < Cahier.actualBookings.length; u++) {
            for (var v = 0; v < Cahier.actualBookings[u].bookables.length; v++) {

                if (Cahier.actualBookings[u].bookables[v].id === bookablesNotAvailable[k].id) {
                    nU = u;   nV = v;
                    break;
                }
            }
        }
        bookingsToFinish = bookingsToFinish.concat(Cahier.actualBookings[nU].ids);
    }
    bookingsToFinish = bookingsToFinish.deleteMultiples();


    var t = div(container);
    var txt = "";
    for (var i = 0; i < bookablesNotAvailable.length; i++) {
        txt += "<li> Le " + bookablesNotAvailable[i].code + " est déjà utilisé par " + bookablesNotAvailable[i].lastBooking.owner.name + "</li> <br/>";
    }
    txt += "";
    t.innerHTML = txt;

    var names = [];
    for (let i = 0; i < bookablesNotAvailable.length; i++) {
        names.push(bookablesNotAvailable[i].lastBooking.owner.name);
    }
    names = names.deleteMultiples();

    var pers = names[0];
    if (names.length === 1) {
        pers = "* En continuant, la sortie de " + pers + " va être automatiquement terminée !";
    }
    else {
        for (let i = 1; i < names.length - 1; i++) {
            pers += ", " + names[i];
        }
        pers += " et de " + names[bookablesNotAvailable.length - 1];
        pers = "* En continuant, les sorties de " + pers + " vont être automatiquement terminées !";
    }


    var btnContainer = div(container);
    btnContainer.style.position = "relative";
    btnContainer.style.textAlign = "center";

    var btn = div(btnContainer);
    btn.classList.add("Buttons");
    btn.style.display = "inline-block";
    btn.innerHTML = "Annuler";
    btn.addEventListener("click", function () { closePopUp("last"); });

    btn = div(btnContainer);
    btn.classList.add("Buttons", "ValidateButtons");
    btn.style.display = "inline-block";
    btn.innerHTML = "Continuer quand même*";
    btn.addEventListener("click", function () {
        var comments = [];
        comments.fillArray(bookingsToFinish.length, "Terminée automatiquement");
        Requests.terminateBooking(bookingsToFinish, comments, false);
        animate();
        closePopUp("last");
    });

    var info = div(btnContainer);
    info.innerHTML = pers;
}