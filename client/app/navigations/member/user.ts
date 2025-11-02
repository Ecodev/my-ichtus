import {$, closePopUp, div, grayBar, openPopUp} from '../general/home';
import {Cahier} from '../cahier/methods';
import {Requests} from '../general/server-requests';
import {Sex} from '../../shared/generated-types';
import type {User} from '../types';

let lastPeople: User[] = [];

export function popUser(nbr = 0, elem: HTMLElement = openPopUp()): void {
    const container = div(elem);
    container.id = nbr.toString();
    container.classList.add('PopUpUserContainer');

    if (elem != $('divTabCahierMemberContainer')) {
        container.classList.add('Boxes');
        const close = div(container);
        close.className = 'divPopUpClose';
        close.onclick = function () {
            closePopUp({target: elem});
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
        if ((this as HTMLInputElement).value.length > 2) {
            search(event);
        } else {
            $('divTabCahierSearchResult').innerHTML =
                "<div style='margin-top:10px; color:var(--fontBlack);'>Veuillez taper au moins trois caractères</div>";
        }
    };
    i1.oninput = function (event) {
        if ((this as HTMLInputElement).value.length > 2) {
            search(event);
        } else {
            $('divTabCahierSearchResult').innerHTML =
                "<div style='margin-top:10px; color:var(--fontBlack);'>Veuillez taper au moins trois caractères</div>";
        }
    };

    i1.onkeydown = function (event) {
        searchDown(event);
    };
    container.appendChild(i1);

    if (elem != $('divTabCahierMemberContainer')) {
        i1.focus();
    }

    const dd = div(container);
    dd.id = 'divTabCahierSearchResult';
}

let enterSearchPosition = 0;
function search(e: KeyboardEvent | Event): void {
    const text = $('inputTabCahierSearch').value.toUpperCase();

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const keyCode = 'keyCode' in e ? e.keyCode : null;
    if (keyCode == 13) {
        const all = document.getElementsByClassName('divTabCahierResultEntry');
        for (const elem of all) {
            if (typeof elem.getElementsByTagName('img')[0] != 'undefined') {
                const nbr = parseInt(document.getElementsByClassName('PopUpUserContainer')[0].id); // modifier problem si plusieurs popUp ouverts...

                Cahier.setOwner(nbr, lastPeople[+elem.id]);
            }
        }
    } else if (keyCode == 40 || keyCode == 38) {
        //do nothing
    } else {
        //text != ""
        Requests.getUsersList(text);
        enterSearchPosition = 0;
    }
}

function searchDown(e: KeyboardEvent): void {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const keyCode = e.keyCode;
    if (keyCode == 40 || keyCode == 38) {
        if (keyCode == 40) {
            enterSearchPosition++;
        } else {
            enterSearchPosition--;
        }
        if (lastPeople.length != 0) {
            for (let i = 0; i < lastPeople.length; i++) {
                const elem = document.getElementsByClassName('divTabCahierResultEntry')[i] as HTMLElement;

                elem.style.backgroundColor = '';
                if (typeof elem.getElementsByTagName('img')[0] != 'undefined') {
                    elem.removeChild(elem.getElementsByTagName('img')[0]);
                }
                if (i == ((enterSearchPosition % lastPeople.length) + lastPeople.length) % lastPeople.length) {
                    const img = document.createElement('img');
                    img.id = 'imgTabCahierSearchEnter';
                    img.src = 'assets/navigations/icons/enter.png';
                    elem.appendChild(img);

                    elem.style.backgroundColor = 'darkgray';
                }
            }
        }
        e.preventDefault();
    }
}

export function createSearchEntries(peopleCorresponding: User[]): void {
    lastPeople = peopleCorresponding;

    $('divTabCahierSearchResult').innerHTML = '';

    if (peopleCorresponding.length == 0) {
        const divResult = document.createElement('div');
        divResult.classList.add('divTabCahierResultEntry');
        $('divTabCahierSearchResult').appendChild(divResult);

        const span1 = document.createElement('span');
        span1.classList.add('spanTabCahierSurName');
        span1.innerHTML = 'Aucun résultat'; //. Cliquez pour vous rendre sur <c style='color:blue; text-decoration:underline;'> ichtus.ch </c>";
        divResult.appendChild(span1);

        divResult.style.backgroundImage = 'url(assets/navigations/icons/no-result.png)';

        lastPeople = [];
    } else {
        for (let i = 0; i < peopleCorresponding.length; i++) {
            const divResult = document.createElement('div');
            //  divResult.id = PeopleCorresponding[i].id;
            divResult.classList.add('divTabCahierResultEntry');
            $('divTabCahierSearchResult').appendChild(divResult);

            const nbr = parseInt(document.getElementsByClassName('PopUpUserContainer')[0].id); // modifier problem si plusieurs popUp ouverts...

            divResult.id = '' + i;

            divResult.addEventListener('mousedown', function () {
                Cahier.setOwner(nbr, peopleCorresponding[+this.id]);
            });

            const span1 = document.createElement('span');
            span1.classList.add('spanTabCahierSurName');
            span1.innerHTML = peopleCorresponding[i].name; //.split(" ")[0]; //changed ! --> div names are false $$
            divResult.appendChild(span1);

            if (i == 0) {
                const img = document.createElement('img');
                img.id = 'imgTabCahierSearchEnter';
                img.src = 'assets/navigations/icons/enter.png';
                divResult.appendChild(img);

                divResult.style.backgroundColor = 'darkgray';
            }

            if (peopleCorresponding[i].sex == Sex.male) {
                divResult.style.backgroundImage = 'url(assets/navigations/icons/man.png)';
            } else {
                divResult.style.backgroundImage = 'url(assets/navigations/icons/woman.png)';
            }
        }
    }
}
