function animate() {

    var b = div(document.body);
    b.id = "black";
       
    setTimeout(function () {

        var c = div(document.body);
        c.id = "circle";
        addSvgClass(c);

        if (document.documentElement.clientWidth < window.innerHeight) {
            c.style.animationName = "AniCircleWidth";
        }
        else {
            c.style.animationName = "AniCircleHeight";
        }

        setTimeout(newLetter, 1000, 0);

        var w = div(document.body);
        w.id = "waves";
        addSvgClass(w);


        var f;
        setTimeout(function () {
            f = div(document.body);
            f.id = "fish";
            addSvgClass(f);
        }, 200);
        

        setTimeout(function () {
            
            w.style.animationName = "AniWavesExit";
            c.style.animationDuration = "1s";
            c.style.animationName = "AniCircleExit";
            f.style.animationName = "AniFishExit,none";

            setTimeout(function () { DeleteObjects(w,c,f); }, 1000);

            setTimeout(function () {
                b.style.animationName = "AniBlackExit";
                DeleteObjects(b);
            }, 500);

        }, 4500);

    }, 500);   
}

function addSvgClass(elem) {
    if (document.documentElement.clientWidth < window.innerHeight) {
        elem.classList.add("svgWidth");
    }
    else {
        elem.classList.add("svgHeight");
    }
    elem.classList.add("svg");
}

function newLetter(i) {

    var d = div(document.body);
    d.classList.add("svgLetters");
    d.classList.add("svg");
    d.id = i;
    if (document.documentElement.clientWidth < window.innerHeight) {
        d.classList.add("svgWidth");
    }
    else {
        d.classList.add("svgHeight");
    }
    d.style.backgroundImage = "url(Img/svg/" + "ichtus"[i] + ".svg)";

    if (i < "ichtus".length-1) {
        setTimeout(newLetter, 100, i+1);
    }

    if (i > 2) {
        setTimeout(function () {
            d.style.animationName = "AniLettersExitRight";
            setTimeout(DeleteObjects, 550, d);
        }, 3000 - 100 + (3-i)*2*100);
    }
    else {
        setTimeout(function () {
            d.style.animationName = "AniLettersExitLeft";
            setTimeout(DeleteObjects, 550, d);
        }, 3000);
    }
}