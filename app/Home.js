//Tabs
var Tab = 0; //Tab -1 -> Cahier, Tab 0 -> Matériel, Tab -1 -> Statistiques


//Load
function load() {
    var scrollBarLength = window.innerWidth - document.documentElement.clientWidth;
    AdjustScreen(window.innerWidth - scrollBarLength, window.innerHeight);
    actualizeTime(); 
    setInterval(actualizeTime, 5000);  //5 secondes
    loadButtons();
    currentTabElement = document.getElementById("divTabCahier");
    document.getElementById("divTopBarTopText").innerHTML = currentTabElement.id + "bonsoir";
    createProgressBar();
    createAllPropositions();
}

function TimeGetMinutes() {
    var m = date.getMinutes();
    if (m < 10) {
        x = "0" + m;
    }
    else {
        x = m.toString();
    }
    return x;
}



//Time
var date;
var Jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
var Mois = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
function actualizeTime() {
    date = new Date();
    document.getElementById("divTopBarTime").innerHTML = date.getHours() + ":" + TimeGetMinutes() + "<br/>" + Jours[date.getDay()] + " " + date.getDate() + " " + Mois[date.getMonth()].substring(0, 3); //.substring(0, 3)


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



