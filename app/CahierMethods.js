var Cahier = {

    // data
    personId: undefined,
    resourceId: undefined,
    nbrAccompagnants: 0,
    destination: "",
    startComment: "",



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
        Cahier.resourceId = undefined;
        Cahier.nbrAccompagnants = 0;
        Cahier.destination = "";
        Cahier.startComment = "";

    },

    // 


};