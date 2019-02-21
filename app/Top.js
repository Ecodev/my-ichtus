var running = false;
var cancelFunction;
var info;

// see ServerRequests for skipping animation
function ableToSkipAnimaiton() {
    document.body.addEventListener("mousedown", cancelFunction);
    info = div(document.body);
    info.innerHTML = "Cliquer pour passer l'animation";
    info.id = "info";
}
function animate() {

    running = true;

     cancelFunction = function () {
        console.log("skipped animation");
        document.body.removeEventListener("mousedown", cancelFunction);
        running = false;
        DeleteObjects(b, c, w, f, info, document.getElementsByClassName("svgLetters")[0], document.getElementsByClassName("svgLetters")[1], document.getElementsByClassName("svgLetters")[2], document.getElementsByClassName("svgLetters")[3], document.getElementsByClassName("svgLetters")[4], document.getElementsByClassName("svgLetters")[5]);
    };

   
    var b, c, w, f;

    b = div(document.body);
    b.id = "black";
       
    setTimeout(function () {
        if (!running) { return; }
        else {
            c = div(document.body);
            c.id = "circle";
            addSvgClass(c);

            if (document.documentElement.clientWidth < window.innerHeight) {
                c.style.animationName = "AniCircleWidth";
            }
            else {
                c.style.animationName = "AniCircleHeight";
            }
           
            setTimeout(newLetter, 1000, 0);

            w = div(document.body);
            w.id = "waves";
            addSvgClass(w);

            setTimeout(function () {
                if (!running) { return; }
                else {
                    f = div(document.body);
                    f.id = "fish";
                    addSvgClass(f);
                }
            }, 200);

            setTimeout(function () {
                if (!running) { return; }
                else {
                    w.style.animationName = "AniWavesExit";
                    c.style.animationDuration = "1s";
                    c.style.animationName = "AniCircleExit";
                    f.style.animationName = "AniFishExit,none";
                

                setTimeout(function () { if (running) { DeleteObjects(w, c, f); } }, 1000);

                setTimeout(function () {
                    if (!running) { return; }
                    else {
                        b.style.animationName = "AniBlackExit";
                        DeleteObjects(b,info);
                    }
                    document.body.removeEventListener("mousedown", cancelFunction);
                    }, 500);
                }

            }, 4500);
        }

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
    if (running) {
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

        if (i < "ichtus".length - 1) {
            setTimeout(newLetter, 100, i + 1);
        }

        if (i > 2) {
            setTimeout(function () {
                d.style.animationName = "AniLettersExitRight";
                setTimeout(function (elem) { if (running) { DeleteObjects(elem); } }, 550, d);
            }, 3000 - 100 + (3 - i) * 2 * 100);
        }
        else {
            setTimeout(function () {
                d.style.animationName = "AniLettersExitLeft";
                setTimeout(function (elem) { if (running) { DeleteObjects(elem); } }, 550, d);
            }, 3000);
        }
    }
}