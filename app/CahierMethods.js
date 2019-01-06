var Cahier = {

    // data
    personId: "",
    personName: "Invité",
    personSurname: "Michel le bg",
    personGender: "Man",
    getFullName: function (name = this.personName, surname = this.personSurname) { return name + " " + surname;},

    bookableId: "", //important
    bookableName: "Matériel personel",

    nbrParticipants: 1,
    destination: "Non défini",
    startComment: "",


    getnbrParticipantsText: function (nbr = Cahier.nbrParticipants,txt = " Participant") {
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

    getStartCommentText: function (txt = Cahier.startComment) {

        var result = "";

        //if (Cahier.personName == "Invité") {
        //    result += "[" + Cahier.personSurname + "] ";
        //}

        if (txt.length < 1 || txt == undefined || txt == null || txt == "") {
            return result + "Pas de commentaire";
        }
        else {
            return result + txt;
        }
    },


    ProgressBarTexts: ["Nom", "Embarcation", "Infos", "Confirmation"],

    // cancel - clearData
    cancel: function () {

        // #divCahier
        $("inputTabCahierSearch").value = "";
        $("divTabCahierSearchResult").innerHTML = "";

        // #divCahierInfos
        var allTabCahierFields = document.getElementsByClassName("TabCahierFields");

        for (var i = 0; i < allTabCahierFields.length - 1; i++) { // -1 POUR EVITER LA TEXTAREA
            allTabCahierFields[i].getElementsByTagName("input")[0].value = "";
            allTabCahierFields[i].getElementsByTagName("input")[0].style.backgroundImage = "none";
            allTabCahierFields[i].getElementsByTagName("input")[0].style.borderColor = "black";
            allTabCahierFields[i].getElementsByTagName("div")[0].style.backgroundColor = "black";
        }

        $('divTabCahierInfosStartComment').getElementsByTagName("textarea")[0].value = "";
        $("divTabCahierInfosNbrInvites").getElementsByTagName("input")[0].value = "0"; //instead of "";

        $('inputTabCahierMaterielElementsInputSearch').value = "";

        $('divTabCahierMaterielElementsSelectSort').getElementsByTagName("select")[0].getElementsByTagName("option")[0].selected = "selected";
        $('divTabCahierMaterielElementsSelectSort').getElementsByTagName("div")[0].style.backgroundImage = 'url("Img/IconSortASC.png")';

        //if ($("checkBoxTabCahierInfosPhoneNumberRemember").getElementsByClassName("checkBox")[0].id == 1) {
        //    check($("checkBoxTabCahierInfosPhoneNumberRemember"));
        //}


        // data
        Cahier.personId = undefined;
        Cahier.personName = "";

        Cahier.bookableId = undefined;
        Cahier.bookableName = "";

        Cahier.nbrParticipants = 0;
        Cahier.destination = "";
        Cahier.startComment = "";


        console.log("--> Cahier.cancel()");
    },

    confirm: function () {
        Requests.createBooking();
        console.log("--> Cahier.confirm()");
    },

    actualizeProgressBar: function () {
        var allDivTabCahierProgressTexts = document.getElementsByClassName("divTabCahierProgressText");
        for (var i = 0; i < allDivTabCahierProgressTexts.length; i++) {
            if (i < currentProgress) {
                switch (i) {
                    case 0:
                        allDivTabCahierProgressTexts[i].innerHTML = Cahier.getFullName();
                        break;
                    case 1:
                        allDivTabCahierProgressTexts[i].innerHTML = Cahier.bookableName;
                        break;
                    case 2:
                        allDivTabCahierProgressTexts[i].innerHTML = Cahier.destination + ", " + Cahier.nbrParticipants + " Acc."
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

        allDivTexts[0].innerHTML = Cahier.getFullName();
        allDivIcons[0].style.backgroundImage = "url(Img/Icon" + Cahier.personGender + ".png)";

        allDivTexts[1].innerHTML = date.getNiceTime();
        allDivIcons[1].style.backgroundImage = "";

        allDivTexts[2].innerHTML = "1880923 857h12";

        $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[0].innerHTML = Cahier.bookableName;
        $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[1].innerHTML = Cahier.bookableId;

        if (Cahier.bookableId == "") {
            $('divTabCahierConfirmation').getElementsByClassName('divTabCahierConfirmationEmbarcationBox')[0].getElementsByTagName("div")[0].style.backgroundImage = "url('Img/IconSup.png')";
        }
     
        allDivTexts[4].innerHTML = Cahier.getnbrParticipantsText();
        allDivIcons[4].style.backgroundImage = "url(Img/IconInvitesTransparent.png)";
        allDivTexts[5].innerHTML = Cahier.destination;
        allDivIcons[5].style.backgroundImage = "url(Img/IconDestinationBlack.png)";

        allDivTexts[6].innerHTML = Cahier.getStartCommentText();
        if (Cahier.personId == "") {
            allDivTexts[6].innerHTML = "[" + Cahier.personSurname + "] " + Cahier.getStartCommentText();
        }
        
    }

    // 


};