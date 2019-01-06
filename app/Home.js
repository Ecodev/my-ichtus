//Tabs
//var Tab = 0; //Tab -1 -> Cahier, Tab 0 -> Matériel, Tab -1 -> Statistiques

function $(id) {
    return document.getElementById(id);
}

function div(loc) {
    var x = document.createElement("div");
    loc.appendChild(x);
    return x;
}


//Load
function load() {
    currentTabElement = $("divTabCahier");
    var scrollBarLength = window.innerWidth - document.documentElement.clientWidth;
    AdjustScreen(window.innerWidth - scrollBarLength, window.innerHeight);
    actualizeTime();
    setInterval(actualizeTime, 5000);  //5 secondes
    loadButtons();
 //   $("divTopBarTopText").innerHTML = currentTabElement.id + "bonsoir";
    createProgressBar();
    createAllPropositions();
    loadMateriel();
    window.location = "#" + "divTabCahier";
    loadReturnButtons(); // OUI OU NON ???????
    loadSpacers();
    loadTableTopBars();
    ServerInitialize();
    Requests.getActualBookingList(true);
    newBookingTable(new Date(),"Sorties terminées");
}



var Time = {

    getActualMinutes: function (m = date.getMinutes()) {
        if (m < 10) {
            x = "0" + m;
        }
        else {
            x = m.toString();
        }
        return x;
    }

};


Date.prototype.getNiceTime = function (separator = ":", addZero = false) {
    if (addZero == true && this.getHours() < 10) {
        return Time.getActualMinutes(this.getHours()) + separator + Time.getActualMinutes(this.getMinutes());
    }
    else {
        return this.getHours() + separator + Time.getActualMinutes(this.getMinutes());
    }
};
Date.prototype.getNiceDate = function (substr = false) {
    if (substr == true) {
        return Jours[this.getDay()] + " " + this.getDate() + " " + Mois[this.getMonth()].substring(0,3);
    }
    else {
        return Jours[this.getDay()] + " " + this.getDate() + " " + Mois[this.getMonth()];
    }

};

Date.prototype.getPreviousDate = function () {
    var yesterday = new Date(this);
    yesterday.setDate(this.getDate() - 1);
    return yesterday;
}


//Time
var date;
var Jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
var Mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
function actualizeTime() {
    date = new Date();
    $("divTopBarTime").innerHTML = date.getNiceTime() + "<br/>" + date.getNiceDate(true); //.substring(0, 3)


}


// 1 -> checked //  0 --> not
function check(checkParent) {
    if (checkParent.getElementsByClassName('checkBox')[0].id == undefined || checkParent.getElementsByClassName('checkBox')[0].id == 1) {
        checkParent.getElementsByClassName('checkBox')[0].id = 0;
        checkParent.getElementsByClassName('checkBox')[0].style.backgroundImage = 'none';
    }
    else {
        checkParent.getElementsByClassName('checkBox')[0].id = 1;
        checkParent.getElementsByClassName('checkBox')[0].style.backgroundImage = 'url(Img/IconCheckSignBlack.png)';
    }
}

function loadReturnButtons() {
    var allReturnButtons = document.getElementsByClassName("ReturnButtons");
    for (var i = 0; i < allReturnButtons.length; i++) {
        //allReturnButtons[i].onclick = "";
        //  allReturnButtons[i].addEventListener("click", function () {
        //       window.history.back();
        //  });
        allReturnButtons[i].title = "Retour";
    }
}


var lastModals = 0;
function openPopUp() {

    var modal = div(document.body);
    modal.onclick = function (event) {
        closePopUp(event,this);
    };
    lastModals++;
    modal.id = "divModal" + lastModals;
    modal.classList.add("Modals");
    modal.style.display = "block";
    setTimeout(function () { modal.style.opacity = 1; }, 10);

    $('divScreen').classList.add("Blur");
    $('divTopBar').classList.add("Blur");

    return modal;
}

function closePopUp(e, elem) {
    var modal = e.target;
    if (modal.id.indexOf("divModal") != -1) {
        modal = $('divModal' + lastModals);
        modal.style.opacity = 0;
        setTimeout(function () { modal.style.display = 'none'; modal.innerHTML = ""; modal.parentNode.removeChild(modal); }, 100);  
        lastModals--;

        if (lastModals == 0) {
            $('divScreen').classList.remove("Blur");
            $('divTopBar').classList.remove("Blur");
        }
    }
}



String.prototype.pixelLength = function (_fontSize = 20) {
    var c = document.createElement("span");
    document.body.appendChild(c);
    c.innerHTML = this;
    c.style.fontSize = _fontSize + "px";
    var length = c.offsetWidth;
    document.body.removeChild(c);
    return length;
};

String.prototype.shorten = function (maxLength, _fontSize = 20) {
    var txt = this;
    if (this == "" || (txt).pixelLength(_fontSize) <= maxLength) {
        return this;
    }
    while ((txt + "...").pixelLength(_fontSize) > maxLength - "...".pixelLength(_fontSize) && txt.length > 0) {
        txt = txt.substr(0, txt.length - 1);
    }
    return txt + "...";
};


function grayBar(elem,marginTop = 10) {
    var d = div(elem);
    d.style.backgroundColor = "lightgray";
    d.style.height = "2px";
    d.style.marginBottom = "15px";
    d.style.marginTop = marginTop + "px";
    d.borderRadius = "2px";

    // '<div style="background-color:gray; height:2px; margin-bottom:15px; margin-top:10px; border-radius:2px;"></div>';
}
