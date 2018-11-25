var b = [];
var divBottomsCounter = 0;
function AdjustBottomBar(tab = $("divTabCahier")) {

    b[divBottomsCounter] = document.createElement("div");
    b[divBottomsCounter].className = "divBottoms";
    tab.appendChild(b[divBottomsCounter]);
    b[divBottomsCounter].innerHTML = divBottomsCounter;

    if (divBottomsCounter == 0) {
        divBottomsCounter++;
    }
    else {
        divBottomsCounter--;
    }

    b[divBottomsCounter] = "";




    //$("divBottom").style.top = "-100px";

    //let scrollHeight = Math.max( //Full document height, with scrolled out part: 
    //    document.body.scrollHeight, document.documentElement.scrollHeight,
    //    document.body.offsetHeight, document.documentElement.offsetHeight,
    //    document.body.clientHeight, document.documentElement.clientHeight
    //);

    //if (scrollHeight + 5 > heightScreen && scrollHeight - 5 < heightScreen) {
    //  //  $("divBottom").style.top = (scrollHeight - 100) + "px";
    //}
    //else {
    //   // $("divBottom").style.top = (scrollHeight + 0) + "px";
    //}

    //$("divBottom").innerHTML = scrollHeight + " -100 ";
}


function loadSpacers() {
    var allDivTabs = document.getElementsByClassName("divTab"); 
    for (var i = 0; i < allDivTabs.length; i++) {
        var s = document.createElement("div");
        s.className = "divSpacers";
        allDivTabs[i].appendChild(s);
    }
}