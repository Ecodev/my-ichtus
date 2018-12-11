var Cahier = {

    // data
    personId: undefined,
    personName: "Michel",
    personSurname: "",
    personGender: "Man",
    getFullName: function () { return this.personName + " " + this.personSurname; },

    bookableId: undefined,
    bookableName: "aa",

    nbrAccompagnants: 0,
    destination: "",
    startComment: "",


    getNbrAccompagnantsText: function () {
        if (Cahier.nbrAccompagnants == 0) {
            return "Aucun";
        }
        else if (Cahier.nbrAccompagnants == 1) {
            return "1 Accompagnant";
        }
        else {
            return Cahier.nbrAccompagnants + " Accompagnants";
        }
    },

    getStartCommentText: function () {
        if (Cahier.startComment == "") {
            return "Pas de commentaire";
        }
        else {
            return Cahier.startComment;
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


        if ($("checkBoxTabCahierInfosPhoneNumberRemember").getElementsByClassName("checkBox")[0].id == 1) {
            check($("checkBoxTabCahierInfosPhoneNumberRemember"));
        }


        // data
        Cahier.personId = undefined;
        Cahier.personName = "";

        Cahier.bookableId = undefined;
        Cahier.bookableName = "";

        Cahier.nbrAccompagnants = 0;
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
                        allDivTabCahierProgressTexts[i].innerHTML = Cahier.destination + ", " + Cahier.nbrAccompagnants + " Acc."
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
        var allDiv = $('divTabCahierConfirmationContainer').getElementsByClassName("divConfirmationTexts");
        var allDivTexts = [];
        var allDivIcons = [];
        for (var i = 0; i < allDiv.length; i++) {
            allDivIcons[i] = allDiv[i].getElementsByTagName("div")[0].getElementsByTagName("div")[0];
            allDivTexts[i] = allDiv[i].getElementsByTagName('div')[3];
        }

        allDivTexts[0].innerHTML = Cahier.getFullName();
        allDivIcons[0].style.backgroundImage = "url(Img/Icon" + Cahier.personGender + ".png)";

        allDivTexts[1].innerHTML = date.getHours() + ":" + TimeGetMinutes();
        allDivIcons[1].style.backgroundImage = "";

        allDivTexts[2].innerHTML = "1880923 857h12";

        $('divTabCahierConfirmationContainerTextsContainer').getElementsByTagName('div')[0].innerHTML = Cahier.bookableName;
        $('divTabCahierConfirmationContainerTextsContainer').getElementsByTagName('div')[1].innerHTML = Cahier.bookableId;

        allDivTexts[4].innerHTML = Cahier.getNbrAccompagnantsText();
        allDivIcons[4].style.backgroundImage = "url(Img/IconInvitesTransparent.png)";
        allDivTexts[5].innerHTML = Cahier.destination;
        allDivIcons[5].style.backgroundImage = "url(Img/IconDestinationBlack.png)";
        allDivTexts[6].innerHTML = Cahier.getStartCommentText();
    }

    // 


};