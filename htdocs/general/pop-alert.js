function popAlert(txt = 'haha ahah ahah ') {
    let elem = openPopUp();

    let container;
    container = div(elem);
    container.classList.add('PopUpAlertContainer');
    container.classList.add('Boxes');

    let close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem}, elem);
    };

    let d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = '!';

    grayBar(container, 5);

    let t = div(container);
    t.innerHTML = txt;
}

function popAlertLate() {
    let elem = openPopUp();

    let container;
    container = div(elem);
    container.classList.add('PopUpAlertContainer', 'booking');
    container.classList.add('Boxes');
    container.style.width = '495px';
    container.style.height = '180px';

    let close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem}, elem);
    };

    let d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = 'Heures tardives';

    grayBar(container, 5);

    let t = div(container);
    t.innerHTML = 'Pour ta sécurité, pense à rentrer avant le coucher du soleil.';

    let btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';

    let btn = div(btnContainer);
    btn.classList.add('Buttons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Ok';
    btn.addEventListener('click', function () {
        closePopUp('last');
        $('divTabCahierMember').getElementsByTagName('input')[0].focus();
    });
}
function popAlertAlreadyHavingABooking(_owner) {
    let elem = openPopUp();

    let container;
    container = div(elem);
    container.classList.add('PopUpAlertContainer', 'booking');
    container.classList.add('Boxes');

    let close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem}, elem);
    };

    let d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = '!';

    grayBar(container, 5);

    let t = div(container);
    t.innerHTML = 'Il semblerait que vous ayez déjà une sortie en cours';

    let btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';

    let btn = div(btnContainer);
    btn.classList.add('Buttons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Voir les sorties';
    btn.addEventListener('click', function () {
        newTab('divTabCahier');
        closePopUp('last');
    });

    btn = div(btnContainer);
    btn.classList.add('Buttons', 'ValidateButtons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Continuer';
    btn.addEventListener('click', function () {
        closePopUp('last');
        Cahier.setOwner(0, _owner, true);
    });
}

function popAlertNoWelcomeSession(_owner) {
    let elem = openPopUp();

    let container;
    container = div(elem);
    container.classList.add('PopUpAlertContainer', 'booking');
    container.classList.add('Boxes');

    let close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem}, elem);
    };

    let d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = "Pas suivi de séance d'accueil";

    grayBar(container, 5);

    let t = div(container);
    t.innerHTML = "Il semblerait que vous n'ayez pas encore suivi de séance d'accueil.";
    t.style.minHeight = '60px';

    let btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';

    let btn = div(btnContainer);
    btn.classList.add('Buttons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Annuler';
    btn.addEventListener('click', function () {
        newTab('divTabCahier');
        closePopUp('last');
    });

    btn = div(btnContainer);
    btn.classList.add('Buttons', 'ValidateButtons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Continuer';
    btn.classList.add('btnRed');
    //_owner.welcomeSessionDate = "fake"; //(new Date()).toISOString(); // fake welcome sesion date
    btn.addEventListener('click', function () {
        closePopUp('last');
        Cahier.setOwner(0, {id: _owner.id, name: _owner.name, sex: _owner.sex, welcomeSessionDate: 'fake'});
    });
    //btn.addEventListener("click", function () { Cahier.setOwner(0, _owner); closePopUp("last"); });
}

function popAlertLessThan13Minutes(_bookable, _booking, _choseFunction) {
    let elem = openPopUp();

    let txt =
        '<b>' +
        Cahier.getOwner(_booking, false) +
        '</b> est parti ' +
        "<red style='color:red'>" +
        deltaTime(new Date(_booking.startDate)).text +
        ' </red> avec le <b>' +
        _bookable.code +
        '</b> !';

    let container;
    container = div(elem);
    container.style.height = '215px';
    container.classList.add('PopUpAlertContainer', 'booking');
    container.classList.add('Boxes');

    let close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem}, elem);
    };

    let d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = 'Embarcation déjà utilisée';

    grayBar(container, 5);

    let t = div(container);
    t.innerHTML = txt + "<br>Êtes-vous sûr que l'embarcation est disponible ?";
    t.style.minHeight = '80px';

    let a = div(container);
    a.style.position = 'absolute';
    a.style.left = '12px';
    a.style.top = '10px';
    a.style.backgroundImage = 'url(../img/icons/alert.png)';
    a.style.backgroundSize = '30px';
    a.style.width = '30px';
    a.style.height = '30px';

    let btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';

    let btn = div(btnContainer);
    btn.classList.add('Buttons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Annuler';
    btn.style.fontSize = '20px';
    btn.addEventListener('click', function () {
        closePopUp('last');
    });

    btn = div(btnContainer);
    btn.classList.add('Buttons', 'ValidateButtons');
    btn.style.display = 'inline-block';
    btn.style.backgroundImage = 'url(img/icons/validated.png)';
    btn.innerHTML = 'Choisir';
    btn.style.fontSize = '20px';
    btn.classList.add('btnRed');

    btn.addEventListener('click', function () {
        closePopUp('last');
        _choseFunction(_bookable);
    });
}

function popAlertBookablesHaveJustBeenBooked(_bookablesNotAvailable) {
    let elem = openPopUp();

    //console.log("_bookablesNotAvailable", _bookablesNotAvailable);

    let txt = '';

    for (let b of _bookablesNotAvailable) {
        txt +=
            '<b>' +
            Cahier.getOwner(b.lastBooking, false) +
            '</b> est parti ' +
            "<red style='color:red'>" +
            deltaTime(new Date(b.lastBooking.startDate)).text +
            ' </red> avec le <b>' +
            b.code +
            '</b> !<br>';
    }
    txt +=
        _bookablesNotAvailable.length == 1
            ? "Êtes-vous sûr que l'embarcation est disponible ?"
            : 'Êtes-vous sûr que les embarcations sont disponibles ?';

    let container;
    container = div(elem);
    container.style.height = 'auto';
    container.style.minHeight = '215px';
    container.style.maxHeight = '80%';
    container.style.width = 'auto';
    container.style.minWidth = '530px';
    container.classList.add('PopUpAlertContainer', 'booking');
    container.classList.add('Boxes');

    let close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem}, elem);
    };

    let d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = _bookablesNotAvailable.length == 1 ? 'Embarcation utilisée !' : 'Embarcations utilisées !';

    grayBar(container, 5);

    let t = div(container);
    t.innerHTML = txt;
    t.style.minHeight = '80px';

    let btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';
    btnContainer.style.marginTop = '5px';

    let btn = div(btnContainer);
    btn.classList.add('Buttons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Annuler';
    btn.style.fontSize = '20px';
    btn.addEventListener('click', function () {
        closePopUp('last');
    });

    btn = div(btnContainer);
    btn.classList.add('Buttons', 'ValidateButtons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Continuer';
    btn.style.fontSize = '20px';
    btn.classList.add('btnRed');

    btn.addEventListener('click', function () {
        closePopUp('last');
        Cahier.confirm();
    });
}

function popAlertMoreBookablesThanParticipants(bookables, participants) {
    let elem = openPopUp();

    let container;
    container = div(elem);
    container.classList.add('PopUpAlertContainer', 'bookable');
    container.classList.add('Boxes');

    let close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem}, elem);
    };

    let d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = "Trop d'embarcations";

    grayBar(container, 5);

    let t = div(container);
    t.innerHTML =
        'Vous avez choisi ' +
        bookables +
        ' embarcations pour seulement ' +
        Cahier.getSingularOrPlural(participants, ' participant') +
        ' !';

    let btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';

    let btn = div(btnContainer);
    btn.classList.add('Buttons', 'ValidateButtons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Modifier le nbr de participants';
    btn.addEventListener('click', function () {
        closePopUp('last');
        popCahierInfos(0);
    });
}

function popAlertTooManyParticipants() {
    let elem = openPopUp();

    let container;
    container = div(elem);
    container.classList.add('PopUpAlertContainer', 'bookable');
    container.classList.add('Boxes');

    let close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem}, elem);
    };

    let d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = 'Trop de participants';

    grayBar(container, 5);

    let t = div(container);
    t.innerHTML = 'Vous pouvez au maximum annoncer 15 participants en une sortie !';

    let btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';

    let btn = div(btnContainer);
    btn.classList.add('Buttons', 'ValidateButtons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Modifier le nbr de participants';
    btn.addEventListener('click', function () {
        closePopUp('last');
        popCahierInfos(0);
    });
}

function popAlertTooManyBookables() {
    let elem = openPopUp();

    let container;
    container = div(elem);
    container.classList.add('PopUpAlertContainer', 'bookable');
    container.classList.add('Boxes');

    let close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem}, elem);
    };

    let d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = "Trop d'embarcations";

    grayBar(container, 5);

    let t = div(container);
    t.innerHTML = 'Vous pouvez au maximum annoncer 10 embarcations en une sortie !';

    let btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';

    let btn = div(btnContainer);
    btn.classList.add('Buttons', 'ValidateButtons');
    btn.style.width = '250px';
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Modifier les embarcations';
    btn.addEventListener('click', function () {
        closePopUp('last');
        newTab('divTabCahierEquipmentChoice');
    });
}

function popAlertBookablesNotAvailable() {
    if (options.showAlertBookablesNotAvailable) {
        // only show pop up if the option is activated, otherwise create the booking and finish the used bookings

        let elem = openPopUp();

        var container;
        container = div(elem);
        container.classList.add('PopUpAlertContainer', 'available');
        container.classList.add('Boxes');

        let close = div(container);
        close.className = 'divPopUpClose';
        close.onclick = function () {
            closePopUp({target: elem}, elem);
        };

        let d = div(container);
        d.style.textAlign = 'center';
        d.style.fontSize = '25px';
        d.innerHTML =
            "<img src='img/icons/alert.png' style='display: inline-block; vertical-align: middle; width:30px;'/> Embarcations déjà utilisées";

        grayBar(container, 5);
    }

    let bookablesNotAvailable = [];
    for (var i = 0; i < Cahier.bookings[0].bookables.length; i++) {
        if (Cahier.bookings[0].bookables[i].available === false) {
            bookablesNotAvailable.push(Cahier.bookings[0].bookables[i]);
        }
    }

    let nU, nV;
    let bookingsToFinish = [];

    // 1.1
    if (options.finishAllBookingsWithBookable) {
        for (var k = 0; k < bookablesNotAvailable.length; k++) {
            for (var u = 0; u < Cahier.actualBookings.length; u++) {
                for (var v = 0; v < Cahier.actualBookings[u].bookables.length; v++) {
                    if (Cahier.actualBookings[u].bookables[v].id === bookablesNotAvailable[k].id) {
                        nU = u;
                        nV = v;
                        break;
                    }
                }
            }
            bookingsToFinish = bookingsToFinish.concat(Cahier.actualBookings[nU].ids);
        }
        bookingsToFinish = bookingsToFinish.deleteMultiples();
    } else {
        for (var k = 0; k < bookablesNotAvailable.length; k++) {
            for (var u = 0; u < Cahier.actualBookings.length; u++) {
                for (var v = 0; v < Cahier.actualBookings[u].bookables.length; v++) {
                    if (Cahier.actualBookings[u].bookables[v].id === bookablesNotAvailable[k].id) {
                        nU = u;
                        nV = v;
                        break;
                    }
                }
            }
            bookingsToFinish = bookingsToFinish.concat(Cahier.actualBookings[nU].ids[nV]); // ids[nV]
        }
    }

    if (options.showAlertBookablesNotAvailable) {
        let t = div(container);
        let txt = '';
        for (var i = 0; i < bookablesNotAvailable.length; i++) {
            txt +=
                '<li> Le ' +
                bookablesNotAvailable[i].code +
                ' est déjà utilisé par ' +
                bookablesNotAvailable[i].lastBooking.owner.name +
                '</li> <br/>';
        }
        txt += '';
        t.innerHTML = txt;

        let names = [];
        for (let i = 0; i < bookablesNotAvailable.length; i++) {
            names.push(bookablesNotAvailable[i].lastBooking.owner.name);
        }
        names = names.deleteMultiples();

        let pers = names[0];
        if (names.length === 1) {
            pers = '* En continuant, la sortie de ' + pers + ' va être automatiquement terminée !';
        } else {
            for (let i = 1; i < names.length - 1; i++) {
                pers += ', ' + names[i];
            }
            pers += ' et de ' + names[bookablesNotAvailable.length - 1];
            pers = '* En continuant, les sorties de ' + pers + ' vont être automatiquement terminées !';
        }

        let btnContainer = div(container);
        btnContainer.style.position = 'relative';
        btnContainer.style.textAlign = 'center';

        let btn = div(btnContainer);
        btn.classList.add('Buttons');
        btn.style.display = 'inline-block';
        btn.innerHTML = 'Annuler';
        btn.addEventListener('click', function () {
            closePopUp('last');
        });

        btn = div(btnContainer);
        btn.classList.add('Buttons', 'ValidateButtons');
        btn.style.display = 'inline-block';
        btn.innerHTML = 'Continuer quand même*';
        btn.addEventListener('click', function () {
            let comments = [];
            comments.fillArray(bookingsToFinish.length, 'Terminée automatiquement');
            Requests.terminateBooking(bookingsToFinish, comments, false);
            animate();
            closePopUp('last');
        });

        let info = div(btnContainer);
        info.innerHTML = pers;
    } else {
        // create & finish bookings directly as no pop up
        let comments = [];
        comments.fillArray(bookingsToFinish.length, 'Terminée automatiquement');
        Requests.terminateBooking(bookingsToFinish, comments, false);
        animate();
        closePopUp('last');
    }
}

function popAlertMissingLicense(_license, _bookable) {
    let elem = openPopUp();

    let container;
    container = div(elem);
    container.classList.add('PopUpAlertContainer', 'booking');
    container.classList.add('Boxes');

    let close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem}, elem);
    };

    let d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = 'Certification manquante !';

    grayBar(container, 5);

    let t = div(container);
    t.innerHTML =
        "Il semblerait que vous n'ayez pas la certification <i style='font-weight:bold'>" +
        _license.name +
        " </i> pour le <asdf style='font-weight:bold'>" +
        _bookable.name +
        '</asdf>';
    t.style.minHeight = '60px';

    let btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';

    let btn = div(btnContainer);
    btn.classList.add('Buttons', 'ValidateButtons');
    btn.style.width = '250px';
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Modifier les embarcations';
    btn.style.backgroundImage = 'none';
    btn.addEventListener('click', function () {
        closePopUp('last');
        newTab('divTabCahierEquipmentChoice');
    });
}
