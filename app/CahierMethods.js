var Cahier = {

    // data
    personId: "",
    personFirstName: "Invité",
    personSurName: "??",
    personGender: "Man",
  //  getFullName: function (surName = this.personSurName, firstName = this.personFirstName) { return surName + " " + firstName;},

    bookableId: "", //important
    bookableName: "Matériel personel",

    nbrParticipants: 1,
    destination: "Non défini",
    startComment: "",

    bookings: [{
        owner: {id:"", firstName:"Invité", surName:"??", sex:"male"},
        bookables: [{ id: "", name: "Matériel personel", code: "" }],
        guest: true,
        guestName:"Il est beau",
        participantCount: 1,
        destination: "Non défini",
        startComment: "",
    }],

    getFullName: function (booking = Cahier.bookings[0]) { return booking.owner.surName + " " + booking.owner.firstName; },


    getnbrParticipantsText: function (nbr = Cahier.nbrParticipants, txt = " Participant") {
        if (nbr == 0) {
            return "Aucun";
        }
        else if (nbr== 1) {
            return "1" + txt;
        }
        else {
            return nbr + txt + "s";
        }
    },


    ProgressBarTexts: ["Nom", "Embarcation", "Infos", "Confirmation"],

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

        $('divTabCahierInfosStartComment').getElementsByTagName("textarea")[0].value = "";
        $("divTabCahierInfosNbrInvites").getElementsByTagName("input")[0].value = "1"; 
        $("divTabCahierInfosDestination").getElementsByTagName("input")[0].value = "Baie"; 

        $('inputTabCahierMaterielElementsInputSearch').value = "";

        $('divTabCahierMaterielElementsSelectSort').getElementsByTagName("select")[0].getElementsByTagName("option")[0].selected = "selected";
        $('divTabCahierMaterielElementsSelectSort').getElementsByTagName("div")[0].style.backgroundImage = 'url("Img/IconSortASC.png")';

        //if ($("checkBoxTabCahierInfosPhoneNumberRemember").getElementsByClassName("checkBox")[0].id == 1) {
        //    check($("checkBoxTabCahierInfosPhoneNumberRemember"));
        //}


        // data
        Cahier.personId = "";
        Cahier.personFirstName = "Invité";
        Cahier.personSurName=  "??";

        Cahier.bookableId = "";
        Cahier.bookableName = "Matériel personel";

        Cahier.nbrParticipants = 1;
        Cahier.destination = "Non défini";
        Cahier.startComment = "";


        console.log("--> Cahier.cancel()");
    },

    confirm: function () {
        Requests.createBooking();
        animate();
        setTimeout(newTab, 3000, 'divTabCahier');
        console.log("--> Cahier.confirm()");
        //        Requests.getActualBookingList(true); moved to the requets, otherwise too fast and doesn't link bookable on the first screen
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
                        allDivTabCahierProgressTexts[i].innerHTML = Cahier.bookings[0].bookables[0].name;
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

        var allDiv = $('divTabCahierConfirmation').getElementsByClassName("divConfirmationTexts");
        var allDivTexts = [];
        var allDivIcons = [];
        for (var i = 0; i < allDiv.length; i++) {
            allDivIcons[i] = allDiv[i].getElementsByTagName("div")[0].getElementsByTagName("div")[0];
            allDivTexts[i] = allDiv[i].getElementsByTagName('div')[3];
        }

        var booking = {}; //simuler un vrai booking 
        if (Cahier.personId != "") {
            booking = { owner: { name: Cahier.getFullName() } };
        }
        else {
            booking = { startComment: "[" + Cahier.personFirstName + "]" };
        }

        $('divTabConfirmationTitle').innerHTML = getownerNameFromBooking(booking, { length: 1000000, fontSize: 25 }) + "<div style='display:inline-block; vertical-align:middle; margin-left:8px;'> à "+ date.getNiceTime()+ "</div>";
    //    $('divTabConfirmationStartTime').innerHTML = "Départ à " + date.getNiceTime();


        allDivTexts[0].innerHTML = getownerNameFromBooking(booking, { length: 1000000, fontSize: 35 });

        allDivTexts[1].innerHTML = date.getNiceTime();

        $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[0].innerHTML = Cahier.bookableName;
        $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[1].innerHTML = Cahier.bookableId;

        if (Cahier.bookableId == "") {
            $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationEmbarcationBox')[0].getElementsByTagName("div")[0].style.backgroundImage = "url('Img/IconSup.png')";
        }


        if (Cahier.bookableId != "") {
            $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationEmbarcationBox')[0].getElementsByTagName("div")[0].addEventListener("click", function () { popBookable(Cahier.bookableId); });
            $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[0].innerHTML = Cahier.bookableName;
            $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[1].innerHTML = Cahier.bookableId + " caté";
            $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationEmbarcationBox')[0].getElementsByTagName("div")[0].style.visibility = "visible";
        }
        else {
            $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[0].innerHTML = "Matériel personel";
            $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[1].innerHTML = "";
            $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationEmbarcationBox')[0].getElementsByTagName("div")[0].style.visibility = "hidden";
        }

     
        allDivTexts[3].innerHTML = Cahier.getnbrParticipantsText();
        allDivTexts[4].innerHTML = Cahier.destination;

    
        allDivTexts[5].innerHTML = Cahier.startComment;
        if (Cahier.personId == "") {
            allDivTexts[5].innerHTML = Cahier.startComment; // "[" + Cahier.personFirstName + "] "  hidden
        }  



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
        Cahier.bookings[nbr].owner = _owner;
        Cahier.bookings[nbr].guest = _guest;
        if (_guest) {
            Cahier.bookings[nbr].guestName = _guestName;
        }
        else {
            Cahier.bookings[nbr].guestName = "Pas d'invité";
        }

        console.log("setOwner(): ", nbr, Cahier.bookings[nbr].owner, Cahier.bookings[nbr].guest, Cahier.bookings[nbr].guestName);
       
        if (nbr == 0) {
            newTab("divTabCahierMaterielCategories");
            $("divTabCahierInfosName").innerHTML = Cahier.bookings[0].owner.surName + " " + Cahier.bookings[0].owner.firstName;
        }
    },

    setBookable: function (nbr = 0, _bookable = { id: "", name: "", code: "" }) {
        Cahier.bookings[nbr].bookables[0] = _bookable;

        console.log("setBookable(): ", nbr, Cahier.bookings[nbr].bookables[0]);
    },

    setInfos: function (nbr = 0, _participantCount = 1, _destination = "Non choisi", _startComment = "mmh.") {
        Cahier.bookings[nbr].participantCount = _participantCount;
        Cahier.bookings[nbr].destination = _destination;
        Cahier.bookings[nbr].startComment = _startComment;

        console.log("setInfos(): ", nbr, Cahier.bookings[nbr].participantCount, Cahier.bookings[nbr].destination, Cahier.bookings[nbr].startComment);
    }

};