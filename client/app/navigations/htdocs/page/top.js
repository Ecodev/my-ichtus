import {deleteElements, div} from '../general/home.js';

let running = false;
let cancelFunction;
let info;

// see ServerRequests for skipping animation
export function ableToSkipAnimation() {
    document.body.addEventListener('mousedown', cancelFunction);
    info = div(document.body);
    info.innerHTML = "Cliquer pour passer l'animation";
    info.id = 'info';
}

export function animate() {
    running = true;

    cancelFunction = function () {
        console.warn('La page va être rafraîchie');
        setTimeout(function () {
            location.reload();
        }, 500);
    };

    let c, w, f, r;

    const b = div(document.body);
    b.id = 'black';

    setTimeout(function () {
        if (!running) {
            return;
        }

        r = div(document.body);
        r.id = 'white_circle';
        addSvgClass(r);

        c = div(document.body);
        c.id = 'circle';
        addSvgClass(c);

        if (document.documentElement.clientWidth < window.innerHeight) {
            c.style.animationName = 'AniCircleWidth';
            r.style.animationName = 'AniCircleWidth';
        } else {
            c.style.animationName = 'AniCircleHeight';
            r.style.animationName = 'AniCircleHeight';
        }

        setTimeout(newLetter, 1000, 0);

        w = div(document.body);
        w.id = 'waves';
        addSvgClass(w);

        setTimeout(function () {
            if (!running) {
                return;
            }

            f = div(document.body);
            f.id = 'fish';
            addSvgClass(f);
        }, 200);

        setTimeout(function () {
            if (!running) {
                return;
            }

            w.style.animationName = 'AniWavesExit';
            c.style.animationDuration = '1s';
            r.style.animationDuration = '1s';
            c.style.animationName = 'AniCircleExit';
            r.style.animationName = 'AniCircleExit';
            f.style.animationName = 'AniFishExit,none';

            setTimeout(function () {
                for (let i = 0; i < 6; i++) {
                    // should be useless
                    deleteElements(document.getElementsByClassName('svgLetters')[0]);
                }
                if (running) deleteElements(w, c, r, f);
                running = false;
            }, 1000);

            setTimeout(function () {
                if (!running) {
                    return;
                } else {
                    b.style.animationName = 'AniBlackExit';
                    deleteElements(b, info);
                    //   location.reload();
                }
                document.body.removeEventListener('mousedown', cancelFunction);
            }, 500);
        }, 4500);
    }, 500);
}

function addSvgClass(elem) {
    if (document.documentElement.clientWidth < window.innerHeight) {
        elem.classList.add('svgWidth');
    } else {
        elem.classList.add('svgHeight');
    }
    elem.classList.add('svg');
}

function newLetter(i) {
    if (running) {
        const d = div(document.body);
        d.classList.add('svgLetters');
        d.classList.add('svg');
        d.id = i;
        if (document.documentElement.clientWidth < window.innerHeight) {
            d.classList.add('svgWidth');
        } else {
            d.classList.add('svgHeight');
        }
        d.style.backgroundImage = 'url(img/logo/' + 'ichtus'[i] + '.svg)';

        if (i < 'ichtus'.length - 1) {
            setTimeout(newLetter, 100, i + 1);
        }

        if (i > 2) {
            setTimeout(
                function () {
                    d.style.animationName = 'AniLettersExitRight';
                    setTimeout(
                        function (elem) {
                            if (running) {
                                deleteElements(elem);
                            }
                        },
                        550,
                        d,
                    );
                },
                3000 - 100 + (3 - i) * 2 * 100,
            );
        } else {
            setTimeout(function () {
                d.style.animationName = 'AniLettersExitLeft';
                setTimeout(
                    function (elem) {
                        if (running) {
                            deleteElements(elem);
                        }
                    },
                    550,
                    d,
                );
            }, 3000);
        }
    }
}
