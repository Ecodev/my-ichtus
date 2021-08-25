var Cahier = {

    actualBookings: [],

    finishedBookings:[],

    bookings: [{
        owner: {id:0,name:"Michel pas défini",sex:"male"},
        bookables: [],
        participantCount: 1,
        destination: "Non défini",
        startComment: ""
    }],

    personalBookable: {
        id: 0,
        code: "Perso",
        name:"Matériel personnel"
    },

    bookingStartDate: new Date(),

    ProgressBarTexts: ["Nom", "Informations", "Embarcations", "Confirmation"],

    getImageUrl: function (_bookable, size = 220) {
        if (_bookable == Cahier.personalBookable) {
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

        Cahier.bookingStartDate = new Date();

        //console.log("--> Cahier.cancel()");
    },

    deleteBooking: function (nbr) {
        Cahier.bookings.splice(nbr, 1);
        Cahier.actualizeConfirmation();
    },

    confirm: function () {

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

        var bookingsIdToFinish = [];
        var bAreNotAvailable = [];
        var bAreNowAvailable = [];
        for (var i = 0; i < _bookings.length; i++) {
            if (_bookings[i].endDate == null) {
                var bookableElement = _bookings[i].bookable;
                bookableElement.lastBooking = _bookings[i].clone();
                bAreNotAvailable.push(bookableElement);
           
                bookingsIdToFinish.push(_bookings[i].id);
            }
        }


        // Add $$ Remove bookables that are still used (but also were in another booking nearly ended)
        for (var i = 0; i < _bookings.length; i++) {

            check: {          
                if (_bookings[i].endDate != null) {
                    for (var u = 0; u < bAreNotAvailable.length; u++) {
                        if (bAreNotAvailable[u].id === _bookings[i].bookable.id) {
                            break check;
                        }
                    }
                    var bookableElement = _bookings[i].bookable;
                    bookableElement.lastBooking = _bookings[i].clone();
                    bAreNowAvailable.push(bookableElement);
                }
            }

        }

        // If there was many bookings which were finished nearly with the same bookable
        bAreNowAvailable = bAreNowAvailable.deleteMultiples();

        // Bookings have been terminated in the last minutes (just for info, has already actualize the bookingsIdToFinish)
        if (bAreNowAvailable.length != 0) {
            for (var bAv of bAreNowAvailable) {
                for (var b of Cahier.bookings[0].bookables) {
                    if (bAv.id === b.id) {
                        if (b.available == false) {                           
                            console.warn("(The " + bAv.code + " has just become available)");
                            Cahier.actualizeAvailability(bAv.id, [bAv.lastBooking]);
                        }
                        break;             
                    }
                }
            }
        }

        // There are used bookables (but we may already know that)
        if (bAreNotAvailable.length != 0) {

            var bHaveJustBeenBooked = [];
            for (var bNAv of bAreNotAvailable) {            
                for (var b of Cahier.bookings[0].bookables) {
                    if (bNAv.id === b.id) {
                        if (b.available == true || b.lastBooking.owner.name != bNAv.lastBooking.owner.name) {                
                            bHaveJustBeenBooked.push(bNAv);
                            Cahier.actualizeAvailability(bNAv.id, [bNAv.lastBooking]);
                        }
                        break;                                         
                    }
                }
            }

            // Will first have to terminated other bookings and then creates the booking
            if (bHaveJustBeenBooked.length == 0) {
                var comments = [];
                comments.fillArray(bookingsIdToFinish.length, "Terminée automatiquement");
                Requests.terminateBooking(bookingsIdToFinish, comments, false);
                animate();
            }
            // New bookables used ! -> alert and reloadConfirmation
            else { 
                popAlertBookablesHaveJustBeenBooked(bHaveJustBeenBooked);
                loadConfirmation();           
                stopWaiting();
            }

        }
        // Can directly create the booking
        else {
            Requests.createBooking();
            animate();   
        }
    },


    actualizeProgressBar: function () {
        var allDivTabCahierProgressTexts = document.getElementsByClassName("divTabCahierProgressText");
        for (var i = 0; i < allDivTabCahierProgressTexts.length; i++) {
            if (i < currentProgress-1) {
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
                        txt = txt.substring(0,txt.length - 2);
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


    setOwner: function (nbr = 0, _owner = { id: "", name: "", sex: "female", welcomeSessionDate: "date" }, force = false) {

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
            Cahier.actualizeConfirmation();

            newTab("divTabCahierInfos");
        }


    },

    addBookable: function (nbr = 0, _bookable = Cahier.personalBookable, _lastBooking) {
        Cahier.bookings[nbr].bookables.push(_bookable);


        if (_bookable == Cahier.personalBookable) {
            document.getElementsByClassName("divTabCahierEquipmentChoiceContainer")[0].children[3].children[0].classList.add("buttonNonActive");
        }
        else if (_lastBooking != undefined) {
            Cahier.bookings[nbr].bookables[Cahier.bookings[nbr].bookables.length - 1].available = _lastBooking.endDate == null ? false : true;
            Cahier.bookings[nbr].bookables[Cahier.bookings[nbr].bookables.length - 1].lastBooking = _lastBooking;
        }
        else Requests.getBookableLastBooking(_bookable.id);
            
        actualizeBookableList();
        Cahier.actualizeConfirmation();
    },

    actualizeAvailability: function (bookableId, bookings) {

        //var u;
        for (var u = 0; u < Cahier.bookings[0].bookables.length; u++) {
            if (Cahier.bookings[0].bookables[u].id === bookableId.toString()) {
                break;
            }
        }

        if (bookings.length !== 0) {
            Cahier.bookings[0].bookables[u].available = bookings[0].endDate == null ? false : true;
            Cahier.bookings[0].bookables[u].lastBooking = bookings[0];
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
