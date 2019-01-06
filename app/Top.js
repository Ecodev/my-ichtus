function animate() {

    var svgs = [];

    svgs.push(div(document.body));
    svgs[svgs.length-1].id = "fish";

    svgs.push(div(document.body));
    svgs[svgs.length - 1].id = "waves";

    svgs.push(div(document.body));
    var a = svgs[svgs.length - 1];
    if (document.documentElement.clientWidth < window.innerHeight) {
        a.style.animationName = "AniCircleWidth";
    }
    else {
        a.style.animationName = "AniCircleHeight";
    }
  
    svgs[svgs.length - 1].id = "circle";
    setTimeout(function () { a.style.opacity = 1; }, 1100);

    setTimeout(newLetter, 1500, 0);

    setTimeout(black, 1000);

    for (var i = 0; i < svgs.length; i++) {
        if (document.documentElement.clientWidth < window.innerHeight) {
            svgs[i].classList.add("svgWidth");
        }
        else {
            svgs[i].classList.add("svgHeight");
        }
        svgs[i].classList.add("svg");
    }
}

function black() {
    var b = div(document.body);
    b.id = "black";
}


function newLetter(i) {

    var d = div(document.body);
    d.classList.add("svgLetters");
    d.classList.add("svg");
    if (document.documentElement.clientWidth < window.innerHeight) {
        d.classList.add("svgWidth");
    }
    else {
        d.classList.add("svgHeight");
    }
    d.style.backgroundImage = "url(Img/svg/" + "ichtus"[i] + ".svg)";

    if (i < "ichtus".length) {
        setTimeout(newLetter, 100, i+1);
    }

}