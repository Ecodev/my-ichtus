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
    createProgressBar();
    createAllPropositions();
    window.location = "#" + "divTabCahier";
    loadReturnButtons(); // OUI OU NON ???????
    loadSpacers();
    loadTableTopBars();
    loadConfirmation();

    //SERVER
    ServerInitialize();
    Requests.getActualBookingList(true);
    loadMateriel();
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
Date.prototype.getNiceDate = function (substr = false, year = false) {
    var r = "";
    if (substr) {
        r = Jours[this.getDay()] + " " + this.getDate() + " " + Mois[this.getMonth()].substring(0,3);
    }
    else {
        r = Jours[this.getDay()] + " " + this.getDate() + " " + Mois[this.getMonth()];
    }
    if (year) {
        r += " " + this.getFullYear();
    }
    return r;
};

Date.prototype.getPreviousDate = function () {
    var yesterday = new Date(this);
    yesterday.setDate(this.getDate() - 1);
    return yesterday;
};

function DeleteObjects() {
    for (var i = 0; i < arguments.length; i++) {
        arguments[i].parentElement.removeChild(arguments[i]);
    }
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


function getownerNameFromBooking(booking, wantImg = false, shortenOptions = {length:100000,fontSize:20}) {
    //mettre un id sur lequel sortTable() va faire le tri puisque c'est le premier texte qui diffère des autres éléments
    if (booking.owner != null) {
        if (wantImg) {
            return "<div id='" + booking.owner.name + "' class='TableEntriesImg' style='background-image:url(Img/IconMan.png);  display: inline-block;vertical-align: middle;'>" + "</div>" + "<div style=' display: inline-block;vertical-align: middle;'>" + booking.owner.name.shorten(shortenOptions.length-40, shortenOptions.fontSize) + "</div>";
        }
        else {
            return booking.owner.name;
        }  
    }
    else {
        var a = booking.startComment.indexOf("[");
        var b = booking.startComment.indexOf("]");
        var txt = "";
        var inv = "Invité";
        if (a == 0  && b != -1) {
            txt += "(" + booking.startComment.slice(a + 1, b) + ")";
        }

        if (wantImg) {
            return "<div id='ZZZZ" + txt + "' class='TableEntriesImg' style='background-image:url(Img/IconInfo.png);  display: inline-block;vertical-align: middle;'></div>" + "<div style=' display: inline-block;vertical-align: middle; min-width:" + 10 + "px'>" + "Invité" + "</div>" + "<div style='margin-left:5px; font-size:15px;  display: inline-block;vertical-align: middle;'>" + txt.shorten(shortenOptions.length - 40 - "Invité".pixelLength(shortenOptions.fontSize)-5, 15) + "</div>";
        }
        else {
            return ("Invité " + txt).shorten(shortenOptions.length, shortenOptions.fontSize); //
        }
 
    }
}
function getStartCommentFromBooking(booking,fill = false) {
    var a = booking.startComment.indexOf("[");
    var b = booking.startComment.indexOf("]");
    var txt = "";

    if (a == 0 && b != -1) {
        txt = booking.startComment.slice(b + 2, booking.startComment.length); // +2 pour enlever l'espace après le ]
    }
    else {
        txt = booking.startComment;
    }
    //console.log(txt.length);
    if (txt.length == 0 && fill) {
        txt = "Pas de commentaire";
    }
    return txt;
}
function getEndCommentFromBooking(booking, fill = false) {
    var a = booking.endComment.indexOf("[");
    var b = booking.endComment.indexOf("]");
    var txt = "";

    if (a == 0 && b != -1) {
        txt = booking.endComment.slice(b + 1, booking.endComment.length);
    }
    else {
        txt = booking.endComment;
    }
    if (txt.length == 0 && fill) {
        txt = "Pas de commentaire";
    }
    return txt;
}



// ARRAY PROTOTYPES
Array.prototype.switch = function (i1, i2) {
    var content_i1 = this[i1];
    this.splice(i1, 1, this[i2]);
    this.splice(i2, 1, content_i1);
    return this;
};

Array.prototype.inverse = function (i1, i2) {
    for (var i = i1; i < parseInt((i1 + i2) / 2 + 0.5); i++) {
        this.switch(i, i1 + i2 - i);
    }
    return this;
};
Array.prototype.findIndex = function (x) {
    var Index = undefined;
    for (var i = 0; i < this.length; i++) {
        if (this[i].toString() == x.toString()) {
            Index = i;
            break;
        }
    }
    return Index;
};

Array.prototype.sortBy = function (sortFields, order = 1) {

    if (order == "ASC") {
        order = -1;
    }
    else if (order == "DESC") {
        order = 1;
    }

    //console.log("sort: ", this, "by: ", sortFields, "order: ", order);

    var switching = true;
    while (switching) {
        switching = false;
        for (var i = 0; i < this.length - 1; i++) {
            if (sortFields[i] > sortFields[i + 1] && order == 1 || sortFields[i] < sortFields[i + 1] && order == -1) { // 
                this.switch(i, i + 1);
                sortFields.switch(i, i + 1);
                switching = true;
            }
        }
    }
    console.log("result of sorting: ",this, "by: ", sortFields);
};

Array.prototype.fillArray = function (length, what = 0) {
    for (var i = 0; i < length; i++) {
        this[i] = what;
    }
};




// ABANDONNED
//function add(bookableId,c) {


//    var filter = {
//        filter: {
//            groups: [
//                { conditions: [{ bookables: { have: { values: [bookableId] } } }] }
//            ]
//        },
//        pagination: {
//            pageSize: 0
//        },
//    };


//    var counter = 0;

//    var variables = new Server.QueryVariablesManager();
//    variables.set('variables', filter);

//    Server.bookingService.getAll(variables).subscribe(r => {

//        console.log(r);
//                                                    // else : already a zero ? maybe change to start of the universe lol        


//        bookings[c] = r.length; // not items.length haha



//        counter++;

//        console.log(c);

//        if (counter == result.items.length) {
//            result.items.sortBy(bookings, order);
//            loadElements(result.items);
//        }
//    });
//}