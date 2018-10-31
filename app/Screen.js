window.onresize = function (event) {
    var scrollBarLength = window.innerWidth - document.documentElement.clientWidth;
    AdjustScreen(window.innerWidth - scrollBarLength, window.innerHeight);    //2*window.innerWidth  - document.documentElement.clientWidth
};


var widthScreen;
var widthToDisplay;
var SmallerThan1500px = false;
var SpaceLeft = 300;
function AdjustScreen(w, h) {

    var widthCache;

    var MaxWidth = 1500;

    widthScreen = w;

    var _divLeftBar  = document.getElementById('divLeftBar' ).style;
    var _divRightBar = document.getElementById('divRightBar').style;

    if (w > MaxWidth) { //Plus grand que le max -> Barres sur les côtés
        widthCache = (w - 1500) / 2;
        widthToDisplay = 1500; 
        SmallerThan1500px = false;
    }
    else { //Plus petit donc pas de barres et compression ?
        widthCache = 0;
        widthToDisplay = widthScreen;
        SmallerThan1500px = true;
    }

    //widthToDisplay = 400;

    _divLeftBar.width = widthCache + "px";
    _divRightBar.width = widthCache + "px";

    //_divScreen 
    var _divScreen = document.getElementById('divScreen').style;
    _divScreen.width = widthToDisplay + "px";
    _divScreen.left = widthCache + "px"; 

    if (SmallerThan1500px == true) {
        SpaceLeft = 160;
        document.getElementById("imgTopBarIchtusText").style.visibility = "hidden";  

        document.getElementById("divTopBarTime").style.visibility = "visible";
        document.getElementById("divTopBarWind").style.visibility = "visible";
        document.getElementById("imgTopBarIchtusLogo").style.visibility = "visible";
        if ((widthScreen - 2 * SpaceLeft) / 3 < 200) {
            SpaceLeft = 0;
            document.getElementById("divTopBarTime").style.visibility = "hidden";
            document.getElementById("divTopBarWind").style.visibility = "hidden";
            document.getElementById("imgTopBarIchtusLogo").style.visibility = "hidden";
        }
    }
    else {
        SpaceLeft = 400;
        document.getElementById("imgTopBarIchtusText").style.visibility = "visible";
        document.getElementById("divTopBarTime").style.visibility = "visible";
        document.getElementById("divTopBarWind").style.visibility = "visible";
        document.getElementById("imgTopBarIchtusLogo").style.visibility = "visible";
        
    }
    
    var d = (widthScreen - 2 * SpaceLeft) / 3;

    document.getElementById("divTopBarButtonMateriel").style.marginLeft = (-100 - d) + "px";
    document.getElementById("divTopBarButtonCahier").style.marginLeft = (-100 + 0) + "px";
    document.getElementById("divTopBarButtonStatistiques").style.marginLeft = (-100 + d) + "px";

    document.getElementById("divTopBarButtonsBar").style.width = d + "px";
    document.getElementById("divTopBarButtonsBar").style.marginLeft = -(widthScreen - 2 * SpaceLeft) / 3 * (-tab + 0.5) + "px";

    document.getElementById("divTopBarTopText").style.marginLeft = -3/2 * d + "px";
    document.getElementById("divTopBarTopText").style.width = 3 * d + "px";
}



window.onscroll = function () { AdjustTopBar() };
function AdjustTopBar() {
    if (document.documentElement.scrollTop >= 60) { //Small
        document.getElementById("divTopBar").style.height = "60px"; 
        document.getElementById("imgTopBarIchtusLogo").style.width = "50px";
        document.getElementById("imgTopBarIchtusText").style.height = "50px";
        document.getElementById("imgTopBarIchtusText").style.left = "60px";
        document.getElementById("divTopBarTime").style.fontSize = "13px";
        document.getElementById("divTopBarWind").style.opacity = 0;   
    } else { //Big
        document.getElementById("divTopBar").style.height = "120px"; 
        document.getElementById("imgTopBarIchtusLogo").style.width = "110px";
        document.getElementById("imgTopBarIchtusText").style.height = "110px";
        document.getElementById("imgTopBarIchtusText").style.left = "120px";
        document.getElementById("divTopBarTime").style.fontSize = "18px";
        document.getElementById("divTopBarWind").style.opacity = 1;
    }
}


function loadButtons() {
    var allButtons = document.getElementsByClassName("divTopBarButtons");
    for (var i = 0; i < allButtons.length; i++) {
        allButtons[i].addEventListener("click", function () { clickTab(this.id) });
    }
}


function getTabName(x) {
    var r = "Cahier";
    switch (x) {
        case -1:
            r = "Materiel";
            break;
        case 0:
            r = "Cahier";
            break;
        case 1:
            r = "Statistiques";
            break;
        default:
            break;
            
    }
    return r;
}
function getTabNumber(x) {
    var r = 0;
    if (x.indexOf("Materiel") !== -1) {
        r = -1;
    }
    else if (x.indexOf("Cahier") !== -1) {
        r = 0;
    }
    else if (x.indexOf("Statistiques") !== -1) {
        r = 1;
    }
    return r;
}



var tab = 0;
var stillMoving = false;
var currentTabElement; //see load for the first element = divtabcahier
var changeTime = 0.3;

function changeTab(newElement, sign) {

    //alert(sign);

    var allDivInDivScreen = document.getElementById("divScreen").getElementsByClassName("divTab");

    currentTabElement.style.zIndex = "10";
    currentTabElement.style.transition = "transform " + changeTime + "s linear 0s";

    newElement.style.zIndex = "5";
   
    currentTabElement.style.transform = "translate(" + (-sign) + "00%)";  //element.style.transform = "translate(" + (-sign * widthToDisplay) + "px)"; //meme chose

    setTimeout(function () {

        currentTabElement.style.zIndex = "2";
        currentTabElement.style.transition = "none";

        currentTabElement.style.transform = "translate(0px)";

        setTimeout(function () { currentTabElement.style.transition = "transform " + changeTime + "s linear 0s"; }, 30);
        setTimeout(function () {
            stillMoving = false;
            currentTabElement = newElement;
            document.getElementById("divTopBarTopText").innerHTML = currentTabElement.id + "   " + stillMoving;
        }, 50);

    }, changeTime * 1000);

    //inputTabCahierSearch focus / blur
    if (newElement.id == "divTabCahier") {
        document.getElementById("inputTabCahierSearch").focus();
    }
    if (currentTabElement.id =="divTabCahier") {
        document.getElementById("inputTabCahierSearch").blur();
    }

    //EnterCahierTop
    if (newElement.id == "divTabCahierMateriel" && currentTabElement.id != "divTabCahierinfos" && currentTabElement.id != "divTabCahierConfirmation") {
        document.documentElement.scrollTop = 60;
        enterProgressBar()
      //  alert("scroll up + CahierTOp zindex 6 -11");
    }
    //Remove CahierTop 
    else if ((currentTabElement.id == "divTabCahierInfos" || currentTabElement.id == "divTabCahierMateriel" || currentTabElement.id == "divTabCahierConfirmation") && newElement.id != "divTabCahierInfos" && newElement.id != "divTabCahierMateriel" && newElement.id != "divTabCahierConfirmation") {
        alert("~Attention vous quittez votre inscription??"); 
        clearData();
        currentProgress = 0; //!!!!!!!!!!!!!!!!!!!!
        removeProgressBar(sign);
       // alert("remove cahiertop");
    }

}

//ENTER PROGRESS BAR
function enterProgressBar() {
    document.getElementById("divTabCahierTop").style.zIndex = 6;
    setTimeout(function () { document.getElementById("divTabCahierTop").style.zIndex = 11; }, changeTime * 1000);
}
//REMOVE PROGRESS BAR
function removeProgressBar(sign) {
    document.getElementById("divTabCahierTop").style.zIndex = "11"; //11
    document.getElementById("divTabCahierTop").style.transition = "transform " + changeTime + "s linear 0s";
    document.getElementById("divTabCahierTop").style.transform = "translate(" + (-sign) + "00%)";

    setTimeout(function () {

        document.getElementById("divTabCahierTop").style.zIndex = "2";
        document.getElementById("divTabCahierTop").style.transition = "none";

        document.getElementById("divTabCahierTop").style.transform = "translate(0px)";

        setTimeout(function () { document.getElementById("divTabCahierTop").style.transition = "transform " + changeTime + "s linear 0s"; }, 20);

    }, changeTime * 1000);
}



function clickTab(buttonID) {

    var oldTab = tab;
    var newTab = getTabNumber(buttonID);

    if (stillMoving == false && currentTabElement.id != "divTab" + getTabName(newTab)) {

        stillMoving = true;

        var sign;
        if (newTab - tab != 0) { //Cahier change
            sign = (newTab - tab) / Math.abs(newTab - tab); // +1 or -1
        }
        else {
            sign = -1; //?
        }

        var _oldTab = document.getElementById("divTab" + getTabName(oldTab));
        var _newTab = document.getElementById("divTab" + getTabName(newTab));

        changeTab(_newTab, sign);

        document.documentElement.scrollTop = 0; //scroll up

        tab = newTab;
        document.getElementById("divTopBarButtonsBar").style.marginLeft = -(widthScreen - 2 * SpaceLeft) / 3 * (-tab + 0.5) + "px";
    }
    else {
        alert("same tab");
    }
}


