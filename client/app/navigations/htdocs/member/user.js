import {$, closePopUp, div, grayBar, openPopUp} from '../general/home.js';
import {Cahier} from '../cahier/methods.js';
import {Requests} from '../general/server-requests.js';

let lastPeople = [];

export function popUser(nbr = 0, elem = openPopUp()) {
    const container = div(elem);
    container.id = nbr;
    container.classList.add('PopUpUserContainer');

    if (elem != $('divTabCahierMemberContainer')) {
        container.classList.add('Boxes');
        const close = div(container);
        close.className = 'divPopUpClose';
        close.onclick = function () {
            closePopUp({target: elem}, elem);
        };
        const d = div(container);
        d.style.textAlign = 'center';
        d.style.fontSize = '25px';
        d.innerHTML = 'Nom et prénom du membre';

        grayBar(container, 5);
    }

    const i1 = document.createElement('input');
    i1.autocomplete = 'off';
    i1.id = 'inputTabCahierSearch';
    i1.title = 'Veuillez écrire votre nom et prénom';
    i1.spellcheck = false;
    i1.type = 'text';
    i1.placeholder = 'Entrez votre nom, prénom...';
    i1.onkeyup = function (event) {
        if (this.value.length > 2) {
            Search(event);
        } else {
            $('divTabCahierSearchResult').innerHTML =
                "<div style='margin-top:10px; color:var(--fontBlack);'>Veuillez taper au moins trois caractères</div>";
        }
    };
    i1.oninput = function (event) {
        if (this.value.length > 2) {
            Search(event);
        } else {
            $('divTabCahierSearchResult').innerHTML =
                "<div style='margin-top:10px; color:var(--fontBlack);'>Veuillez taper au moins trois caractères</div>";
        }
    };

    i1.onkeydown = function (event) {
        SearchDown(event);
    };
    container.appendChild(i1);

    if (elem != $('divTabCahierMemberContainer')) {
        i1.focus();
    }

    const dd = div(container);
    dd.id = 'divTabCahierSearchResult';
}

let enterSearchPosition = 0;
function Search(e) {
    const text = $('inputTabCahierSearch').value.toUpperCase();

    if (e.keyCode == 13) {
        const all = document.getElementsByClassName('divTabCahierResultEntry');
        for (let i = 0; i < all.length; i++) {
            if (typeof all[i].getElementsByTagName('img')[0] != 'undefined') {
                const nbr = parseInt(document.getElementsByClassName('PopUpUserContainer')[0].id); // modifier problem si plusieurs popUp ouverts...

                Cahier.setOwner(nbr, lastPeople[all[i].id]);
            }
        }
    } else if (e.keyCode == 40 || e.keyCode == 38) {
        //do nothing
    } else {
        //text != ""
        Requests.getUsersList(text);
        enterSearchPosition = 0;
    }
}

function SearchDown(e) {
    if (e.keyCode == 40 || e.keyCode == 38) {
        if (e.keyCode == 40) {
            enterSearchPosition++;
        } else {
            enterSearchPosition--;
        }
        if (lastPeople.length != 0) {
            for (let i = 0; i < lastPeople.length; i++) {
                const elem = document.getElementsByClassName('divTabCahierResultEntry')[i];

                elem.style.backgroundColor = '';
                if (typeof elem.getElementsByTagName('img')[0] != 'undefined') {
                    elem.removeChild(elem.getElementsByTagName('img')[0]);
                }
                if (i == ((enterSearchPosition % lastPeople.length) + lastPeople.length) % lastPeople.length) {
                    const img = document.createElement('img');
                    img.id = 'imgTabCahierSearchEnter';
                    img.src = 'img/icons/enter.png';
                    elem.appendChild(img);

                    elem.style.backgroundColor = 'darkgray';
                }
            }
        }
        e.preventDefault();
    }
}

export function createSearchEntries(PeopleCorresponding) {
    lastPeople = PeopleCorresponding;

    $('divTabCahierSearchResult').innerHTML = '';

    if (PeopleCorresponding.length == 0) {
        const divResult = document.createElement('div');
        divResult.classList.add('divTabCahierResultEntry');
        $('divTabCahierSearchResult').appendChild(divResult);

        const span1 = document.createElement('span');
        span1.classList.add('spanTabCahierSurName');
        span1.innerHTML = 'Aucun résultat'; //. Cliquez pour vous rendre sur <c style='color:blue; text-decoration:underline;'> ichtus.ch </c>";
        divResult.appendChild(span1);

        divResult.style.backgroundImage = 'url(img/icons/no-result.png)';

        lastPeople = [];
    } else {
        for (let i = 0; i < PeopleCorresponding.length; i++) {
            const divResult = document.createElement('div');
            //  divResult.id = PeopleCorresponding[i].id;
            divResult.classList.add('divTabCahierResultEntry');
            $('divTabCahierSearchResult').appendChild(divResult);

            const nbr = parseInt(document.getElementsByClassName('PopUpUserContainer')[0].id); // modifier problem si plusieurs popUp ouverts...

            divResult.id = i;

            divResult.addEventListener('mousedown', function () {
                Cahier.setOwner(nbr, PeopleCorresponding[this.id]);
            });

            const span1 = document.createElement('span');
            span1.classList.add('spanTabCahierSurName');
            span1.innerHTML = PeopleCorresponding[i].name; //.split(" ")[0]; //changed ! --> div names are false $$
            divResult.appendChild(span1);

            if (i == 0) {
                const img = document.createElement('img');
                img.id = 'imgTabCahierSearchEnter';
                img.src = 'img/icons/enter.png';
                divResult.appendChild(img);

                divResult.style.backgroundColor = 'darkgray';
            }

            if (PeopleCorresponding[i].sex == 'male') {
                divResult.style.backgroundImage = 'url(img/icons/man.png)';
            } else {
                divResult.style.backgroundImage = 'url(img/icons/woman.png)';
            }
        }
    }
}
