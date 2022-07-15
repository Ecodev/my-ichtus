var Cahier = {

    actualBookings: [],

    finishedBookings: [],

    // 1.4
    editedBooking: {},

    bookings: [{
        owner: { id: 0, name: "Michel pas défini", sex: "male", licenses: [] },
        bookables: [],
        participantCount: 1,
        destination: "Non défini",
        startComment: ""
    }],

    personalBookable: {
        id: 0,
        code: "Perso",
        name: "Matériel personnel",
        licenses: []
    },

    bookingStartDate: new Date(),

    ProgressBarTexts: ["Nom", "Informations", "Embarcations", "Confirmation"],

    getImageUrl: function (_bookable, size = 220) {
        if (_bookable.id == 0) { // matériel personnel
            return 'url(img/icons/own-sail.png)';
        }
        else if (_bookable.image != null) {
            return 'url(https://ichtus.club/api/image/' + _bookable.image.id + '/' + size + ')';
        }
        else {
            return 'url(img/icons/no-picture.png)';
        }
    },

    getFullName: function (booking = Cahier.bookings[0]) {
        if (booking.guest) { return booking.guestName; } else { return booking.owner.name; }
    },

    getSingularOrPlural: function (nbr = Cahier.nbrParticipants, txt = " Participant") {
        if (nbr == 0) {
            return "Aucun";
        }
        else if (nbr == 1) {
            return "1" + txt;
        }
        else {
            return nbr + txt + "s";
        }
    },

    getBookableName: function (booking) {
        if (booking.bookables.length == 0) {
            return "??";
        }
        else {
            return booking.bookables[0].name;
        }
    },

    getBookableCode: function (booking) {
        if (booking.bookables.length == 0) {
            return "";
        }
        else {
            return booking.bookables[0].code;
        }
    },

    // get Owner
    getOwner: function (booking, wantImg = false, shortenOptions = { length: 10000, fontSize: 20 }) {
        if (wantImg) {
            var img = "img/icons/man.png";
            if (booking.owner.sex == "female") { img = "img/icons/woman.png"; }
            return "<div id='" + booking.owner.name + "' class='TableEntriesImg' style='background-image:url(" + img + ");  display: inline-block;vertical-align: middle;'>" + "</div>" + "<div style=' display: inline-block;vertical-align: middle;'>" + booking.owner.name.shorten(shortenOptions.length - 40, shortenOptions.fontSize) + "</div>";
        }
        else {
            return booking.owner.name;
        }
    },

    // new Booking (old)
    newUserBooking: function () {
        popUser(Cahier.bookings.length);
    },

    // new Booking (old)
    newGuestBooking: function () {
        popGuest(Cahier.bookings.length);
    },

    // cancel - clearData
    cancel: function () {

        // #divCahierInfos
        var allTabCahierFields = document.getElementsByClassName("TabCahierFields");

        for (var i = 0; i < allTabCahierFields.length - 1; i++) { // -1 POUR EVITER LA TEXTAREA
            allTabCahierFields[i].getElementsByTagName("input")[0].value = "";
            allTabCahierFields[i].getElementsByTagName("input")[0].style.backgroundImage = "none";
            allTabCahierFields[i].getElementsByTagName("input")[0].style.borderColor = "black";
            allTabCahierFields[i].getElementsByTagName("div")[0].style.backgroundColor = "black";
        }

        document.getElementsByClassName("divTabCahierInfosStartComment")[0].getElementsByTagName("textarea")[0].value = "";
        document.getElementsByClassName("divTabCahierInfosNbrInvites")[0].getElementsByTagName("input")[0].value = "1";
        document.getElementsByClassName("divTabCahierInfosDestination")[0].getElementsByTagName("input")[0].value = "Baie";

        $('inputTabCahierEquipmentElementsInputSearch').value = "";

        $('divTabCahierEquipmentElementsSelectSort').getElementsByTagName("select")[0].getElementsByTagName("option")[0].selected = "selected";
        $('divTabCahierEquipmentElementsSelectSort').getElementsByTagName("div")[0].style.backgroundImage = 'url("img/icons/sort-asc.png")';

        document.getElementsByClassName('divTabCahierEquipmentChoiceInputCodeContainer')[0].getElementsByTagName('input')[0].value = "";

        $('divTabCahierMember').getElementsByTagName("input")[0].value = "";
        $("divTabCahierSearchResult").innerHTML = "";

        changeProgress(1);

        document.getElementsByClassName("divTabCahierEquipmentChoiceContainer")[0].children[3].children[0].classList.remove("buttonNonActive");

        Requests.getActualBookingList();

        Cahier.bookings = [{
            owner: {},
            bookables: [],
            participantCount: 1,
            destination: "Non défini",
            startComment: ""
        }];

        Cahier.editedBooking = {};

        Cahier.bookingStartDate = new Date();

        //console.log("--> Cahier.cancel()");
    },

    deleteBooking: function (nbr) {
        Cahier.bookings.splice(nbr, 1);
        Cahier.actualizeConfirmation();
    },

    confirm: function () {

        // licences check
        for (var bookable of Cahier.bookings[0].bookables) {
            if (bookable.licenses != undefined) {
                for (var license of bookable.licenses) {
                    var foundLicense = false;
                    for (var ownerLicense of Cahier.bookings[0].owner.licenses) {
                        if (ownerLicense.id == license.id) {
                            foundLicense = true;
                        }
                    }
                    if (!foundLicense) {
                        popAlertMissingLicense(license, bookable);
                        return;
                    }
                }
            }
        }

        if (Cahier.bookings[0].participantCount > 15) {
            popAlertTooManyParticipants();
        }
        else if (Cahier.bookings[0].bookables.length > 10) {
            popAlertTooManyBookables();
        }
        else if (Cahier.bookings[0].participantCount < Cahier.bookings[0].bookables.length) { // if more bookables than participants
            popAlertMoreBookablesThanParticipants(Cahier.bookings[0].bookables.length, Cahier.bookings[0].participantCount);
        }
        else {
            // not rechecking if bookables still available
            if (!options.checkIfBookablesNotAvailableWhenConfirming) {
                // if bookables already used
                for (var i = 0; i < Cahier.bookings[0].bookables.length; i++) {
                    if (Cahier.bookings[0].bookables[i].available === false) {
                        break;
                    }
                }

                if (Cahier.bookings[0].bookables.length != i) {
                    popAlertBookablesNotAvailable(); // first terminates and then creates the new booking
                }
                else {
                    Requests.createBooking();
                    animate();
                }
            }
            // rechecking if bookings still available
            else {
                document.body.classList.add("waiting");
                Requests.checksBookablesAvailabilityBeforeConfirming(Cahier.bookings[0].bookables);
            }
        }
    },

    // 1.3
    actualizeConfirmKnowingBookablesAvailability: function (_bookings) { // receive bookings that are still using the bookables and those who have been terminated in the last minutes

        // the bookings that will have to be terminated before creating the actual booking
        var bookingsIdToFinish = [];

        // find all the bookables that are now unavailable
        var bAreNotAvailable = [];
        for (var i = 0; i < _bookings.length; i++) {
            if (_bookings[i].endDate == null) { // check which bookables are being used
                var bookableElement = _bookings[i].bookable;
                bookableElement.lastBooking = _bookings[i].clone();
                bAreNotAvailable.push(bookableElement);
                //                bookingsIdToFinish.push(_bookings[i].id);
            }
        }
        var isNowAvailable = function (_bookable) {
            if (_bookable.id == 0) return true; // matériel personnel
            for (let bNotAvailable of bAreNotAvailable) {
                if (bNotAvailable.id == _bookable.id) {
                    return false;
                }
            }
            return true;
        };
        // get the owner of the last booking that isn't finished yet
        var getLastBooking = function (_bookable) {
            for (let bNotAvailable of bAreNotAvailable) {
                if (bNotAvailable.id == _bookable.id) {
                    return bNotAvailable.lastBooking;
                }
            }
            return false;
        }

        var bookablesHaveJustBeenBooked = []; // or have changed owner !

        // loop through all the chosen bookables
        for (let bookable of Cahier.bookings[0].bookables) {

            // the bookable is supposed to be unavailable
            if (bookable.available == false) {

                // but is now available !
                if (isNowAvailable(bookable)) {
                    console.warn("The " + bookable.code + " has just become available, no need to terminate the booking.");
                    Cahier.actualizeAvailability(bookable.id, []); // has become available
                }
                // and is still unavailable
                else {
                    var itsLastBooking = getLastBooking(bookable);
                    if (itsLastBooking.owner.id == bookable.lastBooking.owner.id) {
                        //                   console.log("owner hasn't changed");
                        bookingsIdToFinish.push(bookable.lastBooking.id);
                    }
                    else {
                        //                    console.log("owner has changed !");
                        Cahier.actualizeAvailability(bookable.id, [itsLastBooking]); // has changed owner
                        var bookableElement = bookable.clone();
                        bookableElement.lastBooking = itsLastBooking.clone();
                        bookablesHaveJustBeenBooked.push(bookableElement);
                    }
                }
            }
            // the bookable is supposed to be available
            else {
                // and is still available
                if (isNowAvailable(bookable)) {
                    // nothing to do
                }
                // but isn't available anymore, so has just been booked (or is in edit mode) !
                else {
                    //                 console.log("has just been booked !");
                    var itsLastBooking = getLastBooking(bookable);

                    // 1.4
                    // no in edit mode, so someone has just booked the bookable, will make an alert
                    if (Cahier.bookings[0].currentlyEditing == undefined) {
                        Cahier.actualizeAvailability(bookable.id, [itsLastBooking]); // has changed owner
                        var bookableElement = bookable.clone();
                        bookableElement.lastBooking = itsLastBooking.clone();
                        bookablesHaveJustBeenBooked.push(bookableElement);
                    }
                    // was in edit mode
                    else {

                        var bookableWasInTheEditedBooking = false;
                        for (let id of Cahier.editedBooking.ids) {
                            if (itsLastBooking.id == id) {
                                bookableWasInTheEditedBooking = true;
                                break;
                            }
                        }

                        // bookable was already in the edited booking and is still there
                        if (bookableWasInTheEditedBooking) {
                            // nothing to do, the edited bookings will terminate by themselves after anyways
                            //                          console.log("because it was edited, so fine :)");
                        }
                        // someone has indeed just booked the bookable, will make an alert
                        else {
                            Cahier.actualizeAvailability(bookable.id, [itsLastBooking]); // has changed owner
                            var bookableElement = bookable.clone();
                            bookableElement.lastBooking = itsLastBooking.clone();
                            bookablesHaveJustBeenBooked.push(bookableElement);
                            //                            console.log("indeed someone has booked it!");
                        }

                    }

                }

            }

        }

        // make alert as some bookables have just been booked
        if (bookablesHaveJustBeenBooked.length != 0) {
            popAlertBookablesHaveJustBeenBooked(bookablesHaveJustBeenBooked);
            loadConfirmation();
            stopWaiting();
        }
        // no alert needed
        else {

            var commentsToFinish = [];
            var idsToFinish = [];

            // 1.4 bookings to terminate because they have been edited (so overwrited, everything will be new)
            if (Cahier.bookings[0].currentlyEditing != undefined) {
                if (Cahier.editedBooking.ids.length != 0) { // doesn't check if the bookings aren't suddenly finished by someone else (would make almost no sense...)
                    commentsToFinish.fillArray(Cahier.editedBooking.ids.length, "(Editée)");
                    idsToFinish = Cahier.editedBooking.ids;
                }
            }

            // bookings to terminate to free the bookables
            var comments = [];
            comments.fillArray(bookingsIdToFinish.length, "Terminée automatiquement");
            commentsToFinish = commentsToFinish.concat(comments);
            idsToFinish = idsToFinish.concat(bookingsIdToFinish);

            // there are no bookings to terminate
            if (idsToFinish.length == 0) {
                Requests.createBooking();
                animate();
            }
            // there are some bookings to terminate first
            else {
                Requests.terminateBooking(idsToFinish, commentsToFinish, false);
                animate();
            }
        }
    },


    actualizeProgressBar: function () {
        var allDivTabCahierProgressTexts = document.getElementsByClassName("divTabCahierProgressText");
        for (var i = 0; i < allDivTabCahierProgressTexts.length; i++) {
            if (i < currentProgress - 1) {
                switch (i) {
                    case 0:
                        allDivTabCahierProgressTexts[i].innerHTML = Cahier.bookings[0].owner.name;
                        break;
                    case 1:
                        allDivTabCahierProgressTexts[i].innerHTML = Cahier.bookings[0].destination + " & " + Cahier.bookings[0].participantCount + " P.";
                        break;
                    case 2:
                        var txt = "";
                        for (let k = 0; k < Cahier.bookings[0].bookables.length; k++) {

                            if (Cahier.bookings[0].bookables[k].code != null) {
                                txt += Cahier.bookings[0].bookables[k].code + ", ";
                            }
                            else {
                                txt += Cahier.bookings[0].bookables[k].name + ", ";
                            }
                        }
                        txt = txt.substring(0, txt.length - 2);
                        allDivTabCahierProgressTexts[i].innerHTML = txt;
                        break;
                    default:
                        break;
                }
            }
            else {
                allDivTabCahierProgressTexts[i].innerHTML = Cahier.ProgressBarTexts[i];
            }
        }

        if (currentProgress == 1) {
            $('divTabCahierProgressReturn').style.visibility = "hidden";
        }
        else {
            $('divTabCahierProgressReturn').style.visibility = "visible";
            $('divTabCahierProgressReturn').onclick = function () {
                newTab(progessionTabNames[currentProgress - 1]);
            };
        }
    },

    actualizeConfirmation: function () {
        if (currentTabElement.id == "divTabCahierConfirmation") {
            loadConfirmation();
        }
    },


    setOwner: function (nbr = 0, _owner = { id: "", name: "", sex: "female", welcomeSessionDate: "date", licenses: [] }, force = false) {

        var t = true;
        if (!force) {
            for (var i = 0; i < Cahier.actualBookings.length; i++) {
                if (Cahier.actualBookings[i].owner.id == _owner.id) {
                    t = false;
                    break;
                }
            }
        }

        //if (_owner.id == "2085") alert("Bonjour maître");

        if (options.showAlertNoWelcomeSession && _owner.welcomeSessionDate == null) {
            popAlertNoWelcomeSession(_owner);
        }
        else if (!t) {
            popAlertAlreadyHavingABooking(_owner);
        }
        else {
            Cahier.bookingStartDate = new Date();
            Cahier.bookings[nbr].owner.id = _owner.id;
            Cahier.bookings[nbr].owner.name = _owner.name;
            Cahier.bookings[nbr].owner.sex = _owner.sex;
            Cahier.bookings[nbr].licenses = []; // empty licenses until the realy licenses come from the request
            Cahier.actualizeConfirmation();
            Requests.getOwnerLicenses(_owner);

            newTab("divTabCahierInfos");
        }
    },

    setOwnerLicenses: function (_owner) {

        if (Cahier.bookings[0].owner.id === result.id) {
            Cahier.bookings[0].owner = result;
        }
        else {
            console.warn("getOwnerLicenses(): request too late or not corresponding to the actual owner " + Cahier.bookings[0].owner.name + "(vs. " + result.name + ")");
        }

    },

    addBookable: function (nbr = 0, _bookable = Cahier.personalBookable, _lastBooking) {
        Cahier.bookings[nbr].bookables.push(_bookable);

        if (_bookable.id == 0) { // matériel personnel
            document.getElementsByClassName("divTabCahierEquipmentChoiceContainer")[0].children[3].children[0].classList.add("buttonNonActive");
        }
        else if (_lastBooking != undefined) { // used when selecting a bookable by code

            Cahier.bookings[nbr].bookables[Cahier.bookings[nbr].bookables.length - 1].available = _lastBooking.endDate == null ? false : true;
            Cahier.bookings[nbr].bookables[Cahier.bookings[nbr].bookables.length - 1].lastBooking = _lastBooking;

            // 1.4 : make fake availability if the actual bookable was in the edited booking
            if (Cahier.bookings[0].currentlyEditing != undefined) {
                for (let bookingId of Cahier.editedBooking.ids) {
                    if (_lastBooking.id == bookingId) {
                        Cahier.bookings[nbr].bookables[Cahier.bookings[nbr].bookables.length - 1].available = true;
                        break;
                    }
                }
            }

        }
        else Requests.getBookableLastBooking(_bookable.id);

        actualizeBookableList();
        Cahier.actualizeConfirmation();
    },

    actualizeAvailability: function (bookableId, bookings) {

        for (var u = 0; u < Cahier.bookings[0].bookables.length; u++) {
            if (Cahier.bookings[0].bookables[u].id === bookableId.toString()) {
                break;
            }
        }

        if (bookings.length !== 0) {

            var lastBooking = bookings[0];

            Cahier.bookings[0].bookables[u].available = bookings[0].endDate == null ? false : true;
            Cahier.bookings[0].bookables[u].lastBooking = lastBooking;

            // 1.4 : make fake availability (actually already used in the current booking that is being edited...)
            if (Cahier.bookings[0].currentlyEditing != undefined) {
                for (let bookingId of Cahier.editedBooking.ids) {
                    if (lastBooking.id == bookingId) {
                        Cahier.bookings[0].bookables[u].available = true;
                        break;
                    }
                }
            }

        }
        else {
            Cahier.bookings[0].bookables[u].available = true;
        }
        actualizeBookableList();
        Cahier.actualizeConfirmation();
    },

    removeBookable: function (nbr = 0, _bookable = 0) {

        for (var i = 0; i < Cahier.bookings[nbr].bookables.length; i++) {
            if (Cahier.bookings[nbr].bookables[i].id == _bookable.id) {
                break;
            }
        }

        if (_bookable == Cahier.personalBookable) {
            document.getElementsByClassName("divTabCahierEquipmentChoiceContainer")[0].children[3].children[0].classList.remove("buttonNonActive");
        }

        Cahier.bookings[nbr].bookables.splice(i, 1);

        //console.log("removeBookable(): ", nbr, Cahier.bookings[nbr].bookables);
        Cahier.actualizeConfirmation();
        actualizeBookableList();
        if (currentTabElement.id == "divTabCahierEquipmentElements") {
            actualizeElements();
        }
    },

    setInfos: function (nbr = 0, _participantCount = 1, _destination = "Non choisi", _startComment = "mmh.") {
        Cahier.bookings[nbr].participantCount = _participantCount;
        Cahier.bookings[nbr].destination = _destination;
        Cahier.bookings[nbr].startComment = _startComment;

        //console.log("setInfos(): ", nbr, Cahier.bookings[nbr].participantCount, Cahier.bookings[nbr].destination, Cahier.bookings[nbr].startComment);
        Cahier.actualizeConfirmation();
    }

};




function transformComment(txt, fill) {
    txt = txt.replaceTxtByTxt("nft", " <img style='display:inline-block; vertical-align:middle;' src='img/comments/nft.png'/> ");
    txt = txt.replaceTxtByTxt("joran", " joran<img style='display:inline-block; vertical-align:middle;' src='img/comments/joran.png'/> ", true);
    txt = txt.replaceTxtByTxt("Joran", " Joran<img style='display:inline-block; vertical-align:middle;' src='img/comments/joran.png'/> ", true);
    txt = txt.replaceTxtByTxt("soleil", "soleil<img style='display:inline-block; vertical-align:middle;' src='img/comments/soleil.png'/> ", true);
    txt = txt.replaceTxtByTxt("Soleil", "Soleil<img style='display:inline-block; vertical-align:middle;' src='img/comments/soleil.png'/> ", true);
    txt = txt.replaceTxtByTxt("Corto", "<img style='display:inline-block; vertical-align:middle;' src='img/comments/corto.png'/> ", true);
    txt = txt.replaceTxtByTxt("Dimitri", "<img style='display:inline-block; vertical-align:middle;' src='img/comments/dimitri.png'/> ", true);

    if (txt.length == 0 && fill) {
        txt = "Pas de commentaire";
    }
    return txt;
}

function getStartCommentFromBooking(booking, fill = false) {
    var txt = booking.startComment;
    return transformComment(txt, fill);
}

function getEndCommentFromBooking(booking, fill = false) {
    var txt = booking.endComment;
    return transformComment(txt, fill);
}
