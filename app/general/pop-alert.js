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
    btn.addEventListener("click", function () { closePopUp("last"); Cahier.setOwner(0, _owner,true);  });
}

function popAlertNoWelcomeSession(_owner) {
    var elem = openPopUp();

    var container;
    container = div(elem);
    container.classList.add("PopUpAlertContainer", "booking");
    container.classList.add("Boxes");

    var close = div(container);
    close.className = "divPopUpClose";
    close.onclick = function () {
        closePopUp({ target: elem }, elem);
    };

    var d = div(container);
    d.style.textAlign = "center";
    d.style.fontSize = "25px";
    d.innerHTML = "Pas suivi de séance d'accueil";

    grayBar(container, 5);

    var t = div(container);
    t.innerHTML = "Il semblerait que vous n'ayiez pas encore suivi de séance d'accueil.";
    t.style.minHeight = "60px";

    var btnContainer = div(container);
    btnContainer.style.position = "relative";
    btnContainer.style.textAlign = "center";

    var btn = div(btnContainer);
    btn.classList.add("Buttons");
    btn.style.display = "inline-block";
    btn.innerHTML = "Annuler";
    btn.addEventListener("click", function () { newTab("divTabCahier"); closePopUp("last"); });

    btn = div(btnContainer);
    btn.classList.add("Buttons", "ValidateButtons");
    btn.style.display = "inline-block";
    btn.innerHTML = "Continuer";
    btn.classList.add("btnRed");
    //_owner.welcomeSessionDate = "fake"; //(new Date()).toISOString(); // fake welcome sesion date
    btn.addEventListener("click", function () { closePopUp("last"); Cahier.setOwner(0, { id: _owner.id, name: _owner.name, sex: _owner.sex, welcomeSessionDate: "fake" });  });
    //btn.addEventListener("click", function () { Cahier.setOwner(0, _owner); closePopUp("last"); });
}

function popAlertLessThan13Minutes(_bookable, _booking, _choseFunction) {
    var elem = openPopUp();

    var txt = "<b>" + Cahier.getOwner(_booking, false) + "</b> est parti "
              + "<red style='color:red'>" + deltaTime(new Date(_booking.startDate)).text
              + " </red> avec le <b>" + _bookable.code + "</b> !";

    var container;
    container = div(elem);
    container.style.height = "215px";
    container.classList.add("PopUpAlertContainer", "booking");
    container.classList.add("Boxes");

    var close = div(container);
    close.className = "divPopUpClose";
    close.onclick = function () {
        closePopUp({ target: elem }, elem);
    };

    var d = div(container);
    d.style.textAlign = "center";
    d.style.fontSize = "25px";
    d.innerHTML = "Embarcation déjà utilisée";

    grayBar(container, 5);

    var t = div(container);
    t.innerHTML = txt + "<br>Êtes-vous sûr que l'embarcation est disponible ?";
    t.style.minHeight = "80px";

    var btnContainer = div(container);
    btnContainer.style.position = "relative";
    btnContainer.style.textAlign = "center";

    var btn = div(btnContainer);
    btn.classList.add("Buttons");
    btn.style.display = "inline-block";
    btn.innerHTML = "Annuler";
    btn.style.fontSize = "20px";
    btn.addEventListener("click", function () { closePopUp("last"); });

    btn = div(btnContainer);
    btn.classList.add("Buttons", "ValidateButtons");
    btn.style.display = "inline-block";
    btn.style.backgroundImage = "url(img/icons/validated.png)";
    btn.innerHTML = "Choisir";
    btn.style.fontSize = "20px";
    btn.classList.add("btnRed");

    btn.addEventListener("click", function () { closePopUp("last"); _choseFunction(_bookable); });
}

function popAlertBookablesHaveJustBeenBooked(_bookablesNotAvailable) {
    var elem = openPopUp();

    //console.log("_bookablesNotAvailable", _bookablesNotAvailable);

    var txt = "";

    for (var b of _bookablesNotAvailable) {
        txt += "<b>" + Cahier.getOwner(b.lastBooking, false) + "</b> est parti "
            + "<red style='color:red'>" + deltaTime(new Date(b.lastBooking.startDate)).text
            + " </red> avec le <b>" + b.code + "</b> !<br>";
    }
    txt += _bookablesNotAvailable.length == 1 ? "Êtes-vous sûr que l'embarcation est disponible ?" : "Êtes-vous sûr que les embarcations sont disponibles ?";

    var container;
    container = div(elem);
    container.style.height = "auto";
    container.style.minHeight = "215px";
    container.style.maxHeight = "80%";
    container.style.width = "auto";
    container.style.minWidth = "530px";
    container.classList.add("PopUpAlertContainer", "booking");
    container.classList.add("Boxes");

    var close = div(container);
    close.className = "divPopUpClose";
    close.onclick = function () {
        closePopUp({ target: elem }, elem);
    };

    var d = div(container);
    d.style.textAlign = "center";
    d.style.fontSize = "25px";    
    d.innerHTML = _bookablesNotAvailable.length == 1 ? "Embarcation utilisée !" : "Embarcations utilisées !";

    grayBar(container, 5);

    var t = div(container);
    t.innerHTML = txt;
    t.style.minHeight = "80px";

    var btnContainer = div(container);
    btnContainer.style.position = "relative";
    btnContainer.style.textAlign = "center";
    btnContainer.style.marginTop = "5px";

    var btn = div(btnContainer);
    btn.classList.add("Buttons");
    btn.style.display = "inline-block";
    btn.innerHTML = "Annuler";
    btn.style.fontSize = "20px";
    btn.addEventListener("click", function () { closePopUp("last"); });

    btn = div(btnContainer);
    btn.classList.add("Buttons", "ValidateButtons");
    btn.style.display = "inline-block";
    btn.innerHTML = "Continuer";
    btn.style.fontSize = "20px";
    btn.classList.add("btnRed");

    btn.addEventListener("click", function () { closePopUp("last"); Cahier.confirm();});
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


function popAlertTooManyParticipants() {
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
    d.innerHTML = "Trop de participants";

    grayBar(container, 5);

    var t = div(container);
    t.innerHTML = "Vous pouvez au maximum annoncer 15 participants en une sortie !";

    var btnContainer = div(container);
    btnContainer.style.position = "relative";
    btnContainer.style.textAlign = "center";

    var btn = div(btnContainer);
    btn.classList.add("Buttons", "ValidateButtons");
    btn.style.display = "inline-block";
    btn.innerHTML = "Modifier le nbr de participants";
    btn.addEventListener("click", function () { closePopUp("last"); popCahierInfos(0); });
}

function popAlertTooManyBookables() {
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
    t.innerHTML = "Vous pouvez au maximum annoncer 10 embarcations en une sortie !";

    var btnContainer = div(container);
    btnContainer.style.position = "relative";
    btnContainer.style.textAlign = "center";

    var btn = div(btnContainer);
    btn.classList.add("Buttons", "ValidateButtons");
    btn.style.width = "250px";
    btn.style.display = "inline-block";
    btn.innerHTML = "Modifier les embarcations";
    btn.addEventListener("click", function () { closePopUp("last"); newTab("divTabCahierEquipmentChoice"); });
}

function popAlertBookablesNotAvailable() {

    if (options.showAlertBookablesNotAvailable) { // only show pop up if the option is activated, otherwise create the booking and finish the used bookings

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
    }

    var bookablesNotAvailable = [];
    for (var i = 0; i < Cahier.bookings[0].bookables.length; i++) {
        if (Cahier.bookings[0].bookables[i].available === false) {
            bookablesNotAvailable.push(Cahier.bookings[0].bookables[i]);
        }
    }

    var nU, nV;
    var bookingsToFinish = [];

    // 1.1
    if (options.finishAllBookingsWithBookable) {

        for (var k = 0; k < bookablesNotAvailable.length; k++) {

            for (var u = 0; u < Cahier.actualBookings.length; u++) {
                for (var v = 0; v < Cahier.actualBookings[u].bookables.length; v++) {

                    if (Cahier.actualBookings[u].bookables[v].id === bookablesNotAvailable[k].id) {
                        nU = u; nV = v;
                        break;
                    }
                }
            }
            bookingsToFinish = bookingsToFinish.concat(Cahier.actualBookings[nU].ids);
        }
        bookingsToFinish = bookingsToFinish.deleteMultiples();
    }
    else {
        for (var k = 0; k < bookablesNotAvailable.length; k++) {

            for (var u = 0; u < Cahier.actualBookings.length; u++) {
                for (var v = 0; v < Cahier.actualBookings[u].bookables.length; v++) {

                    if (Cahier.actualBookings[u].bookables[v].id === bookablesNotAvailable[k].id) {
                        nU = u; nV = v;
                        break;
                    }
                }
            }
            bookingsToFinish = bookingsToFinish.concat(Cahier.actualBookings[nU].ids[nV]); // ids[nV]
        }
    }

    if (options.showAlertBookablesNotAvailable) {
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
    else { // create & finish bookings directly as no pop up
        var comments = [];
        comments.fillArray(bookingsToFinish.length, "Terminée automatiquement");
        Requests.terminateBooking(bookingsToFinish, comments, false);
        animate();
        closePopUp("last");
    }
}

function popAlertMissingLicense(_license, _bookable) {
    var elem = openPopUp();

    var container;
    container = div(elem);
    container.classList.add("PopUpAlertContainer", "booking");
    container.classList.add("Boxes");

    var close = div(container);
    close.className = "divPopUpClose";
    close.onclick = function () {
        closePopUp({ target: elem }, elem);
    };

    var d = div(container);
    d.style.textAlign = "center";
    d.style.fontSize = "25px";
    d.innerHTML = "Certification manquante";

    grayBar(container, 5);

    var t = div(container);
    t.innerHTML = "Il semblerait que vous n'ayiez pas la certification <i>" + _license.name + " </i> pour le " + _bookable.name;
    t.style.minHeight = "60px";

    var btnContainer = div(container);
    btnContainer.style.position = "relative";
    btnContainer.style.textAlign = "center";

    var btn = div(btnContainer);
    btn.classList.add("Buttons");
    btn.style.display = "inline-block";
    btn.innerHTML = "as";
    btn.addEventListener("click", function () { newTab("divTabCahier"); closePopUp("last"); });

    btn = div(btnContainer);
    btn.classList.add("Buttons", "ValidateButtons");
    btn.style.display = "inline-block";
    btn.innerHTML = "??";
    btn.classList.add("btnRed");
    btn.addEventListener("click", function () { closePopUp("last"); });
}


