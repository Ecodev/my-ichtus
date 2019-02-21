var Cahier = {

    bookings: [{
        owner: {},
        bookables: [],
        guest: true,
        guestName: "Il est beau",
        participantCount: 1,
        destination: "Non défini",
        startComment: ""
    }],

    getFullName: function (booking = Cahier.bookings[0]) {
        if (booking.guest) { return booking.guestName; } else { return booking.owner.surName + " " + booking.owner.firstName; }
    },


    getnbrParticipantsText: function (nbr = Cahier.nbrParticipants, txt = " Participant") {
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
            return "Matériel Personel";
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

    // new with guest:
    getOwner: function (booking, wantImg = false, shortenOptions = { length: 10000, fontSize: 20 }, onlyName = false) {

        if (booking.guest == false) {
            if (wantImg) {
                var img = "Img/IconWoman.png";
                if (booking.owner.sex == "male") { img = "Img/IconMan.png"; }

                return "<div id='" + booking.owner.name + "' class='TableEntriesImg' style='background-image:url(" + img + ");  display: inline-block;vertical-align: middle;'>" + "</div>" + "<div style=' display: inline-block;vertical-align: middle;'>" + booking.owner.name.shorten(shortenOptions.length - 40, shortenOptions.fontSize) + "</div>";
            }
            else {
                return booking.owner.name;
            }
        }
        else {
            var guestName = "";

            if (booking.guestName != undefined) {
                guestName = " (" + booking.guestName + ")";
            }
            else {
                var a = booking.startComment.indexOf("[");
                var b = booking.startComment.indexOf("]");

                if (a == 0 && b != -1) {
                    guestName = " (" + booking.startComment.slice(a + 1, b) + ")";
                }
            }

            var ownerName = booking.owner.name;
            if (booking.owner.name == undefined || booking.owner.name == "Booking Only") { //$$ booking only
                ownerName = "Invité";
            }

            if (wantImg) {
                if (onlyName) {
                    return "<div id='" + guestName.slice(2,-1) + "' class='TableEntriesImg' style='background-image:url(" + "Img/IconGuest.png" + ");  display: inline-block;vertical-align: middle;'>" + "</div>" + "<div style=' display: inline-block;vertical-align: middle;'>" + guestName.slice(2,-1).shorten(shortenOptions.length - 40, shortenOptions.fontSize) + "</div>";

                }
                else {
                    return "<div id='ZZZZ" + ownerName + "' class='TableEntriesImg' style='background-image:url(Img/IconGuest.png);  display: inline-block;vertical-align: middle;'></div>" + "<div style=' display: inline-block;vertical-align: middle; min-width:" + 10 + "px'>" + ownerName + "</div>" + "<div style='margin-left:5px; font-size:15px;  display: inline-block;vertical-align: middle;'>" + guestName.shorten(shortenOptions.length - 40 - "Invité".pixelLength(shortenOptions.fontSize) - 5, 15) + "</div>";
                }
            }
            else {
                if (onlyName) {
                    return guestName.shorten(shortenOptions.length, shortenOptions.fontSize); //
                }
                else {
                    return (booking.owner.name + guestName).shorten(shortenOptions.length, shortenOptions.fontSize); //
                }
            }
        }
    },


    //new Booking
    newUserBooking: function () {
        popUser(Cahier.bookings.length); 
    },

    //new Booking
    newGuestBooking: function () {
        popGuest(Cahier.bookings.length);
    },

    ProgressBarTexts: ["Nom", "Embarcation", "Informations", "Confirmation"],

    // cancel - clearData
    cancel: function () {

        // #divCahier
        //$("inputTabCahierSearch").value = "";
        //$("divTabCahierSearchResult").innerHTML = "";

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

        $('inputTabCahierMaterielElementsInputSearch').value = "";

        $('divTabCahierMaterielElementsSelectSort').getElementsByTagName("select")[0].getElementsByTagName("option")[0].selected = "selected";
        $('divTabCahierMaterielElementsSelectSort').getElementsByTagName("div")[0].style.backgroundImage = 'url("Img/IconSortASC.png")';

        document.getElementsByClassName('divTabCahierMaterielChoiceInputCodeContainer')[0].getElementsByTagName('input')[0].value = "";

        //if ($("checkBoxTabCahierInfosPhoneNumberRemember").getElementsByClassName("checkBox")[0].id == 1) {
        //    check($("checkBoxTabCahierInfosPhoneNumberRemember"));
        //}

        Cahier.bookings = [{
            owner: {},
            bookables: [],
            guest: true,
            guestName: "Il est beau",
            participantCount: 1,
            destination: "Non défini",
            startComment: ""
        }];

        console.log("--> Cahier.cancel()");
    },

    deleteBooking: function (nbr) {
        Cahier.bookings.splice(nbr, 1);
        Cahier.actualizeConfirmation();
    },

    confirm: function () {

        for (var i = 0; i < Cahier.bookings.length; i++) {
            Requests.createBooking(i,Cahier.bookings.length);
        }
       
        animate();
        console.log("--> Cahier.confirm()");
        //        Requests.getActualBookingList(true); moved to the requests, otherwise too fast and doesn't link bookable on the first screen
    },

    actualizeProgressBar: function () {
        var allDivTabCahierProgressTexts = document.getElementsByClassName("divTabCahierProgressText");
        for (var i = 0; i < allDivTabCahierProgressTexts.length; i++) {
            if (i < currentProgress) {
                switch (i) {
                    case 0:
                        allDivTabCahierProgressTexts[i].innerHTML = Cahier.getFullName(Cahier.bookings[0]);
                        break;
                    case 1:
                        allDivTabCahierProgressTexts[i].innerHTML = Cahier.getBookableName(Cahier.bookings[0]);
                        break;
                    case 2:
                        allDivTabCahierProgressTexts[i].innerHTML = Cahier.bookings[0].destination + ", " + Cahier.bookings[0].participantCount + " Acc.";
                        break;
                    default:
                        break;
                }
            }
            else {
                allDivTabCahierProgressTexts[i].innerHTML = Cahier.ProgressBarTexts[i];
            }
        }
    },

    actualizeConfirmation: function () {

        //var allDiv = $('divTabCahierConfirmation').getElementsByClassName("divConfirmationTexts");
        //var allDivTexts = [];
        //var allDivIcons = [];
        //for (var i = 0; i < allDiv.length; i++) {
        //    allDivIcons[i] = allDiv[i].getElementsByTagName("div")[0].getElementsByTagName("div")[0];
        //    allDivTexts[i] = allDiv[i].getElementsByTagName('div')[3];
        //}

        var booking = {}; //simuler un vrai booking 
        if (Cahier.personId != "") {
            booking = { owner: { name: Cahier.getFullName() } };
        }
        else {
            booking = { startComment: "[" + Cahier.personFirstName + "]" };
        }

        $('divTabConfirmationTitle').innerHTML = Cahier.getOwner(Cahier.bookings[0], true, { length: 1000000, fontSize: 25 }) + "<div style='display:inline-block; vertical-align:middle; margin-left:8px;'> à " + date.getNiceTime() + "</div>";



    //    $('divTabConfirmationStartTime').innerHTML = "Départ à " + date.getNiceTime();


        //allDivTexts[0].innerHTML = Cahier.getOwnerNameFromBooking(booking, { length: 1000000, fontSize: 35 });

        //allDivTexts[1].innerHTML = date.getNiceTime();

        //$('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[0].innerHTML = Cahier.bookableName;
        //$('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[1].innerHTML = Cahier.bookableId;

        //if (Cahier.bookableId == "") {
        //    $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationEmbarcationBox')[0].getElementsByTagName("div")[0].style.backgroundImage = "url('Img/IconSup.png')";
        //}


        //if (Cahier.bookableId != "") {
        //    $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationEmbarcationBox')[0].getElementsByTagName("div")[0].addEventListener("click", function () { popBookable(Cahier.bookableId); });
        //    $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[0].innerHTML = Cahier.bookableName;
        //    $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[1].innerHTML = Cahier.bookableId + " caté";
        //    $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationEmbarcationBox')[0].getElementsByTagName("div")[0].style.visibility = "visible";
        //}
        //else {
        //    $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[0].innerHTML = "Matériel personel";
        //    $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[1].innerHTML = "";
        //    $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationEmbarcationBox')[0].getElementsByTagName("div")[0].style.visibility = "hidden";
        //}

     
        //allDivTexts[3].innerHTML = Cahier.getnbrParticipantsText();
        //allDivTexts[4].innerHTML = Cahier.destination;

    
       // allDivTexts[5].innerHTML = Cahier.startComment;
        //if (Cahier.personId == "") {
        //    allDivTexts[5].innerHTML = Cahier.startComment; // "[" + Cahier.personFirstName + "] "  hidden
        //}  

        $('divTabConfirmationBookingsContainer').innerHTML = "";

        for (var i = 0; i < Cahier.bookings.length; i++) {
            createConfirmationBooking(Cahier.bookings[i],i);
        }
    },

    //chosePerson:function(surName, firstName, id) {
    //    Cahier.personFirstName = firstName;
    //    Cahier.personSurName = surName;
    //    Cahier.personId = id;

    //    newTab("divTabCahierMaterielCategories");
    //    $("divTabCahierInfosName").innerHTML = surName + " " + firstName;
    //    console.log("chosePerson -->", "surName: " + surName, "firstName: " + firstName, "id: " + id);
    //    closePopUp("last");
    //},

    setOwner: function (nbr = 0, _owner = { id: "", firstName: "", surName: "", sex: "female" }, _guest = false, _guestName = "Michel le guest") {

        if (nbr >= Cahier.bookings.length) {
            if (_guest) {
                Cahier.bookings.push({
                    owner: {},
                    bookables: [],
                    guest: true,
                    guestName: "Waw",
                    participantCount: 1,
                    destination: Cahier.bookings[0].destination,
                    startComment: Cahier.bookings[0].startComment
                });
            }
            else {
                Cahier.bookings.push({
                    owner: {},
                    bookables: [],
                    guest: false,
                    guestName: "Waw",
                    participantCount: 1,
                    destination: Cahier.bookings[0].destination,
                    startComment: Cahier.bookings[0].startComment
                });
            }
            console.log("New Booking !");
        }


        Cahier.bookings[nbr].guest = _guest;
        if (_guest) {
            Cahier.bookings[nbr].guestName = _guestName;
            if (nbr != 0) {
                Cahier.bookings[nbr].owner = Cahier.bookings[0].owner;
            }
            else {
                console.log('Sortie principale avec un invité !');
            }
        }
        else {
            Cahier.bookings[nbr].guestName = "Pas d'invité";
            Cahier.bookings[nbr].owner.id = _owner.id;
            Cahier.bookings[nbr].owner.firstName = _owner.firstName;
            Cahier.bookings[nbr].owner.surName = _owner.surName;
            Cahier.bookings[nbr].owner.name = _owner.surName + " " + _owner.firstName;
            Cahier.bookings[nbr].owner.sex = _owner.sex;
        }

        console.log("setOwner(): ", nbr, Cahier.bookings[nbr].owner, Cahier.bookings[nbr].guest, Cahier.bookings[nbr].guestName);
        Cahier.actualizeConfirmation();
       
        if (nbr == 0) {
            newTab("divTabCahierMaterielChoice");
            $("divTabCahierInfosName").innerHTML = Cahier.getFullName(Cahier.bookings[0]);
        }
    },

    setBookable: function (nbr = 0, _bookable = {}) {

        if (_bookable.id == undefined) { // no id means MP
            Cahier.bookings[nbr].bookables = []; 
        }
        else {
            Cahier.bookings[nbr].bookables[0] = _bookable;
        }

        console.log("setBookable(): ", nbr, Cahier.bookings[nbr].bookables);
        Cahier.actualizeConfirmation();
    },

    setInfos: function (nbr = 0, _participantCount = 1, _destination = "Non choisi", _startComment = "mmh.") {
        Cahier.bookings[nbr].participantCount = _participantCount;
        Cahier.bookings[nbr].destination = _destination;
        Cahier.bookings[nbr].startComment = _startComment;

        console.log("setInfos(): ", nbr, Cahier.bookings[nbr].participantCount, Cahier.bookings[nbr].destination, Cahier.bookings[nbr].startComment);
        Cahier.actualizeConfirmation();
    }

};