function loadSpacers() {
    var allDivTabs = document.getElementsByClassName("divTab"); 
    for (var i = 0; i < allDivTabs.length; i++) {
        var s = div(allDivTabs[i]);
        s.className = "divSpacers";

        var b = div(allDivTabs[i]);
        b.className = "divBottoms";
    }
}