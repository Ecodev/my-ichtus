var Cahier = {

    // data
    personId: undefined,
    personName: "Michel",
    personSurname: "",
    getFullName: function () { return this.personName + " " + this.personSurname;},

    resourceId: undefined,
    resourceName: "aa",

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




    ProgressBarTexts: ["Nom", "Embarcation", "Infos", "Confirmation"],

    // cancel - clearData
    cancel: function () {

        // #divCahier
        $("inputTabCahierSearch").value = "";
        $("divTabCahierSearchResult").innerHTML = "";

        // #divCahierInfos
        var allTabCahierFields = document.getElementsByClassName("TabCahierFields");

        for (var i = 0; i < allTabCahierFields.length; i++) {
            allTabCahierFields[i].getElementsByTagName("input")[0].value = "";
            allTabCahierFields[i].getElementsByTagName("input")[0].style.backgroundImage = "none";
            allTabCahierFields[i].getElementsByTagName("input")[0].style.borderColor = "black";
            allTabCahierFields[i].getElementsByTagName("div")[0].style.backgroundColor = "black";
        }
        document.getElementById("divTabCahierInfosNbrInvites").getElementsByTagName("input")[0].value = "0"; //instead of "";


        if ($("checkBoxTabCahierInfosPhoneNumberRemember").getElementsByClassName("checkBox")[0].id == 1) {
            check($("checkBoxTabCahierInfosPhoneNumberRemember"));
        }


        // data
        Cahier.personId = undefined;
        Cahier.personName = "";

        Cahier.resourceId = undefined;
        Cahier.resourceName = "";

        Cahier.nbrAccompagnants = 0;
        Cahier.destination = "";
        Cahier.startComment = "";

    },

    confirm: function () {
        Requests.createBooking();
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
                        allDivTabCahierProgressTexts[i].innerHTML = Cahier.resourceName;
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
        for (var i = 0; i < allDiv.length; i++) {
            allDivTexts[i] = allDiv[i].getElementsByTagName('div')[2];
        }

        allDivTexts[0].innerHTML = Cahier.getFullName();
        allDivTexts[1].innerHTML = date.getHours() + ":" + TimeGetMinutes();
        allDivTexts[2].innerHTML = "1880923 857h12";

        $('divTabCahierConfirmationContainerTextsContainer').getElementsByTagName('div')[0].innerHTML = Cahier.resourceName;
        $('divTabCahierConfirmationContainerTextsContainer').getElementsByTagName('div')[1].innerHTML = Cahier.resourceId;

        allDivTexts[6].innerHTML = Cahier.getNbrAccompagnantsText();
        allDivTexts[7].innerHTML = Cahier.destination;
        allDivTexts[8].innerHTML = Cahier.startComment;
    }

    // 


};