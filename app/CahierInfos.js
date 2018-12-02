function writePhoneNumber(e, elem) {
    var txt = elem.value;

    var t = txt.split(" ");
    var number = "";
    for (var i = 0; i < t.length; i++) {
        number += t[i];
    }

   // alert(number);



    //FIRST WAY
    //var regex = /[0-9]|\./;
    //var key = String.fromCharCode(e.keyCode);
    //if (regex.test(key)) {
    //    number += key;
    //    // alert(number + "  length:" + number.length);

    //    var r = "";
    //    for (var i = 0; i < number.length-1; i++) {            
    //        r += number[i];
    //        if (r.length == 3 || r.length == 7 || r.length == 10) {
    //            r += " ";
    //        }
    //    }

    //    elem.value = r;
    //}
    //else {
    //  //  alert("pas cool");
    //}



    //SECOND WAY
    var theEvent = e;//|| window.event;
    var key;
    // Handle paste
    if (theEvent.type === 'paste') {
        key = event.clipboardData.getData('text/plain');
    }
    else {
        // Handle key press
        key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
    }
    var regex = /[0-9]|\./;
    if ((txt.length == 3 || txt.length == 7 || txt.length == 10) & e.keyCode != 8) {
        elem.value = txt + " ";
    }
    if (e.keyCode != 8 && e.keyCode != 9) {// || e.keyCode == 39 || e.keyCode == 46) || e.keyCode == 37)
        if (!regex.test(key) || (elem.value + key).length > 13) {
            theEvent.returnValue = false;
            if (theEvent.preventDefault) {
                theEvent.preventDefault();
            }
        }
        else {
           
        }
    }

    if (e.keyCode == 13) {
        checkInfos();
    }





}


function checkPhoneNumber(elem) {
 

    var txt = elem.value;

    var t = txt.split(" ");
    var number = "";
    for (var i = 0; i < t.length; i++) {
        number += t[i];
    }

    var r = "";
    for (var i = 0; i < number.length; i++) {
        
        if (r.length == 3 || r.length == 7 || r.length == 10) {
            r += " ";
        }
        r += number[i];
    }

    elem.value = r;



    txt = elem.value.toUpperCase();

    if (txt.length == 13) {
        AcceptInfos(elem);
    }
    else {
        DenyInfos(elem);
    }
}


function writeDestination(elem) {
    
    if (elem.value.length > 2) {
        AcceptInfos(elem);
    }
    else {
        DenyInfos(elem);
    }
}
function writeCommment(elem) {
    if (elem.value.length > -1) {
        AcceptInfos(elem);
    }
    else {
        DenyInfos(elem);
    }
}
function writeNbrInvites(elem = document.getElementById("divTabCahierInfosNbrInvites").getElementsByTagName("input")[0]) {
    if (parseInt(elem.value) < 21 && elem.value != "") {
        AcceptInfos(elem);
    }
    else {
        DenyInfos(elem);
    }
}



function createAllPropositions() {
    var allDestinationPropositions = $("divTabCahierInfosDestinationPropositions").getElementsByTagName("div");
    for (var i = 0; i < allDestinationPropositions.length; i++) {
        allDestinationPropositions[i].addEventListener("mousedown", function () {
            document.getElementById("divTabCahierInfosDestination").getElementsByTagName("input")[0].value = this.innerHTML;
            writeDestination(document.getElementById("divTabCahierInfosDestination").getElementsByTagName("input")[0]);
        });
    }

    var allNbrInvitesPropositions = $("divTabCahierInfosNbrInvitesPropositions").getElementsByTagName("div");
    for (var i = 0; i < allNbrInvitesPropositions.length; i++) {
        allNbrInvitesPropositions[i].addEventListener("mousedown", function () {
            if (this.innerHTML == "Aucun") {
                document.getElementById("divTabCahierInfosNbrInvites").getElementsByTagName("input")[0].value = 0;
            }
            else {
                document.getElementById("divTabCahierInfosNbrInvites").getElementsByTagName("input")[0].value = parseInt(this.innerHTML);
            }
            writeNbrInvites(document.getElementById("divTabCahierInfosNbrInvites").getElementsByTagName("input")[0]);
        });
    }


    //initalize timepropositions
}

function focusInOrOut(elem, focus) {
    var allPropositions = elem.parentElement.getElementsByClassName("PropositionsContainer")[0].getElementsByTagName("div");

    for (var i = 0; i < allPropositions.length; i++) {
        if (focus == true) {
            setTimeout(enterProposition, i * 60, allPropositions[i]);
        }
        else {
            setTimeout(exitProposition, i * 60, allPropositions[allPropositions.length - i - 1]);
        }
    }
}

function enterProposition(elem,x) {
    elem.style.marginLeft = "0px";
    elem.style.marginRight = "10px";
    elem.style.opacity = 1;
}

function exitProposition(elem) {
    elem.style.marginLeft = "200px";
    elem.style.marginRight = "-190px";
    elem.style.opacity = 0;
}









function AcceptInfos(elem) {
    elem.style.backgroundImage = "url(Img/IconCheckSignBlack.png)";
    elem.style.borderColor = "black";
    elem.parentElement.getElementsByTagName("div")[0].style.backgroundColor = "black";
}
function DenyInfos(elem) {
    elem.style.backgroundImage = "none";
}

function checkInfos() {
    var allTabCahierFields = document.getElementsByClassName("TabCahierFields");
    var allInfosOkay = true;
    for (var i = 0; i < allTabCahierFields.length; i++) {
        if (allTabCahierFields[i].getElementsByTagName("input")[0].style.backgroundImage == "" || allTabCahierFields[i].getElementsByTagName("input")[0].style.backgroundImage =="none") {
            allTabCahierFields[i].getElementsByTagName("input")[0].style.borderColor = "red";
            allTabCahierFields[i].getElementsByTagName("div")[0].style.backgroundColor = "red";
            allInfosOkay = false;
        }
    }
    if (allInfosOkay == true || document.getElementById("divTabCahierInfosDestination").getElementsByTagName("input")[0].value == "pass") {

        Cahier.nbrAccompagnants = parseInt($('divTabCahierInfosNbrInvites').getElementsByTagName('input')[0].value);
        Cahier.destination = $('divTabCahierInfosDestination').getElementsByTagName('input')[0].value;
        Cahier.startComment = $('divTabCahierInfosStartComment').getElementsByTagName('input')[0].value;

        newTab("divTabCahierConfirmation");
    }
 
}