window.onresize = function (event) {
    var scrollBarLength = window.innerWidth - document.documentElement.clientWidth;
    AdjustScreen(window.innerWidth - scrollBarLength, window.innerHeight);    //2*window.innerWidth  - document.documentElement.clientWidth
};


var widthScreen;
var heightScreen;
var widthToDisplay;
var SmallerThan1500px = false;
var SpaceLeft = 300;
function AdjustScreen(w, h) {

    var widthCache;

    var MaxWidth = 1500;

    widthScreen = w;
    heightScreen = h;

    var _divLeftBar = $('divLeftBar').style;
    var _divRightBar = $('divRightBar').style;

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
}



window.onscroll = function () { AdjustTopBar(); };
function AdjustTopBar() {
    if (document.documentElement.scrollTop >= 60) { //Small
       // $("divTopBar").style.height = "60px";
      //  $("imgTopBarIchtusLogo").style.width = "50px";
     //   $("imgTopBarIchtusText").style.height = "50px";
     //   $("imgTopBarIchtusText").style.left = "60px";
    //    $("divTopBarTime").style.fontSize = "13px";
    //    $("divTopBarWind").style.opacity = 0;
    } else { //Big
     //   $("divTopBar").style.height = "120px";
     //   $("imgTopBarIchtusLogo").style.width = "110px";
     //   $("imgTopBarIchtusText").style.height = "110px";
     //   $("imgTopBarIchtusText").style.left = "120px";
      //  $("divTopBarTime").style.fontSize = "18px";
      //  $("divTopBarWind").style.opacity = 1;
    }
}


function loadButtons() {
    var allButtons = document.getElementsByClassName("divTopBarButtons");
    for (var i = 0; i < allButtons.length; i++) {
        allButtons[i].addEventListener("click", function () { newTab("divTab" + this.id.substr(this.id.indexOf("Button") + 6)); });
    }
}




var stillMoving = false;
var currentTabElement;// = $("divTabCahier"); //see load for the first element = divtabcahier
var changeTime = 0.3;

function changeTab(newElement, sign) {

    stillMoving = true;

    document.documentElement.scrollTop = 0;

    currentTabElement.style.zIndex = "10";
    currentTabElement.style.transition = "transform " + changeTime + "s linear 0s";

    newElement.style.zIndex = "5";

    currentTabElement.style.transform = "translate(" + (-sign) + "00%)";  //element.style.transform = "translate(" + (-sign * widthToDisplay) + "px)"; //meme chose

    newElement.style.top = "0px";

    setTimeout(function () {

        currentTabElement.style.zIndex = "2";
        currentTabElement.style.transition = "none";

        currentTabElement.style.transform = "translate(0px)";

        setTimeout(function () { currentTabElement.style.transition = "transform " + changeTime + "s linear 0s"; }, 30);
        setTimeout(function () {
            stillMoving = false;
            currentTabElement.style.top = "-30000px";
            currentTabElement = newElement;
            //$("divTopBarTopText").innerHTML = NewElement.id + "  " + NewElement.order + "   " + stillMoving + " topbar:" + NewElement.TopBar;
        }, 50);

    }, changeTime * 1000);
}


function newTab(id) {
    if (stillMoving == false) {
        window.location = "#" + id;
    }
}

//    document.documentElement.scrollTop = 60;

var tabs = [];
tabs.push({ id: "divTabMateriel", order: -1, progress: 0, position: -1, TopBar: false, Enter: function () { }, Remove: function () { } });
tabs.push({ id: "divTabCahier", order: 0, progress: 0, position: 0, TopBar: false, Enter: function () { Cahier.cancel(); }, Remove: function () { } });
tabs.push({ id: "divTabStatistiques", order: 1, progress: 0, position: 1, TopBar: false, Enter: function () { }, Remove: function () { } });
tabs.push({ id: "divTabCahierMaterielOptions", order: 10, progress: 1, position: 0, TopBar: true, Enter: function () { }, Remove: function () { } });
tabs.push({ id: "divTabCahierMaterielCode", order: 11, progress: 1, position: 0, TopBar: true, Enter: function () { }, Remove: function () { } });
tabs.push({ id: "divTabCahierMaterielCategories", order: 12, progress: 1, position: 0, TopBar: true, Enter: function () { }, Remove: function () { } });
tabs.push({ id: "divTabCahierMaterielElements", order: 13, progress: 1, position: 0, TopBar: true, Enter: function () { $('divTabCahierCancelButton').style.top = "120px"; MaterielElementsFirstLoad = true; Requests.getBookablesList(); $('inputTabCahierMaterielElementsInputSearch').focus(); }, Remove: function () { $('divTabCahierCancelButton').style.top = "145px"; } });
tabs.push({ id: "divTabCahierInfos", order: 14, progress: 2, position: 0, TopBar: true, Enter: function () { $("divTabCahierInfosNbrInvites").getElementsByTagName("input")[0].focus(); writeNbrInvites($("divTabCahierInfosNbrInvites").getElementsByTagName("input")[0]); writeDestination($("divTabCahierInfosDestination").getElementsByTagName("input")[0]) }, Remove: function () { } });
tabs.push({ id: "divTabCahierConfirmation", order: 15, progress: 3, position: 0, TopBar: true, Enter: function () { Cahier.actualizeConfirmation(); createConfirmationBooking(); }, Remove: function () { } });


//WINDOW LOCATION CHANGE
var OldElement = tabs[1];
var NewElement = tabs[1];
window.onhashchange = function () {

    var newLocation = window.location.toString();
    var res = newLocation.substr(newLocation.indexOf("#") + 1);

    if (res != currentTabElement.id) { //onload refresh

        var i0;
        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].id == res) {
                i0 = i;
                NewElement = tabs[i];
                break;
            }
        }

        var sign = 1;
        if (NewElement.progress == 0 && OldElement.progress != 0 && NewElement.id != "divTabCahier") {
            sign = NewElement.order;
        }
        else if (NewElement.order < OldElement.order) {
            sign = -1;
        }

        changeTab($(NewElement.id), sign);

        // TopBar Enter/Remove
        if (NewElement.TopBar == true && OldElement.TopBar == false) {
            enterProgressBar(sign);
        }
        else if (NewElement.TopBar == false && OldElement.TopBar == true) {
            removeProgressBar(sign);
        }


        //alert("NEW: " + NewElement.id + " / " + NewElement.TopBar +"  OLD: " + OldElement.id +" / " +OldElement.TopBar);


        // Enter & Remove Functions
        NewElement.Enter();
        OldElement.Remove();

        // WhiteBar
        $("divTopBarButtonsBar").style.marginLeft = -(widthScreen - 2 * SpaceLeft) / 3 * (-NewElement.position + 0.5) + "px";

        // change ProgressBar
        changeProgress(NewElement.progress);

        // actualize Progress Bar // AFTER CHANGING PROGRESS
        Cahier.actualizeProgressBar();

        // save OldElement
        OldElement = NewElement;

        // alert("new:" + newOrder + "   old:" + oldOrder);
    }
};





//ENTER PROGRESS BAR
function enterProgressBar() {
    $("divTabCahierTop").style.zIndex = 6;
    setTimeout(function () { $("divTabCahierTop").style.zIndex = 11; }, changeTime * 1000);
}
//REMOVE PROGRESS BAR
function removeProgressBar(sign) {
    $("divTabCahierTop").style.zIndex = "11"; //11
    $("divTabCahierTop").style.transition = "transform " + changeTime + "s linear 0s";
    $("divTabCahierTop").style.transform = "translate(" + (-sign) + "00%)";

    setTimeout(function () {

        $("divTabCahierTop").style.zIndex = "2";
        $("divTabCahierTop").style.transition = "none";

        $("divTabCahierTop").style.transform = "translate(0px)";

        setTimeout(function () { $("divTabCahierTop").style.transition = "transform " + changeTime + "s linear 0s"; }, 20);

    }, changeTime * 1000);
}




function ReadText() {



    var myFileInput = $('file');
    var myFile = myFileInput.files[0];


    var reader = new FileReader();

    reader.onload = function () {
        var fileContents = this.result;
        alert(fileContents);
    }

    if (myFile != null) {
        reader.readAsText(myFile);
    }

}
