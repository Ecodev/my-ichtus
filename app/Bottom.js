function AdjustBottomBar() {
    $("divBottom").style.top = "-100px";

    let scrollHeight = Math.max( //Full document height, with scrolled out part: 
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );

    if (scrollHeight + 5 > heightScreen && scrollHeight - 5 < heightScreen) {
        $("divBottom").style.top = (scrollHeight - 100) + "px";
    }
    else {
        $("divBottom").style.top = (scrollHeight + 0) + "px";
    }

    $("divBottom").innerHTML = scrollHeight + " -100 ";
}
