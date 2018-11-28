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


    actualizeProgressBar: function () {
        var alldivTabCahierProgressTexts = document.getElementsByClassName("divTabCahierProgressText");
        for (var i = 0; i < alldivTabCahierProgressTexts.length; i++) {
            if (i < currentProgress) {
                switch (i) {
                    case 0:
                        alldivTabCahierProgressTexts[i].innerHTML = Cahier.getFullName();
                        break;
                    case 1:
                        alldivTabCahierProgressTexts[i].innerHTML = Cahier.resourceName;
                        break;
                    case 2:
                        alldivTabCahierProgressTexts[i].innerHTML = Cahier.destination + " " + Cahier.nbrAccompagnants;
                        break;
                    default:
                        break;
                }
            }
            else {
                alldivTabCahierProgressTexts[i].innerHTML = Cahier.ProgressBarTexts[i];
            }
        }
    }

    // 


};