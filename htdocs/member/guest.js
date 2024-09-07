import {closePopUp, div, grayBar, openPopUp} from '../general/home.js';
import {Cahier} from '../cahier/methods.js';

export function popGuest(nbr = 0) {
    let elem = openPopUp();

    let container;
    container = div(elem);
    container.id = nbr;
    container.classList.add('PopUpGuestContainer');
    container.classList.add('Boxes');

    let close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem}, elem);
    };

    let d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = "Nom et prénom de l'invité";

    grayBar(container, 5);

    div(container);

    let i1 = document.createElement('input');
    container.appendChild(i1);
    i1.placeholder = 'Nom';
    i1.spellcheck = false;

    let i2 = document.createElement('input');
    i2.placeholder = 'Prénom';
    i2.spellcheck = false;
    i2.addEventListener('keyup', function (event) {
        if (event.keyCode == 13) {
            ValidateGuest();
        }
    });
    container.appendChild(i2);

    let b = div(container);
    b.classList.add('Buttons');
    b.classList.add('ValidateButtons');
    b.innerHTML = 'Suivant';
    b.style.backgroundPositionX = '115px';
    b.addEventListener('click', function () {
        ValidateGuest();
    });
}

function ValidateGuest() {
    let c = document.getElementsByClassName('PopUpGuestContainer')[0];
    let i = c.getElementsByTagName('input');
    if (i[0].value.length < 2) {
        i[0].style.borderColor = 'red';
        i[0].previousElementSibling.style.backgroundColor = 'red';
    } else {
        i[0].style.borderColor = 'black';
        i[0].previousElementSibling.style.backgroundColor = 'white';
    }
    if (i[1].value.length < 2) {
        i[1].style.borderColor = 'red';
    } else {
        i[1].style.borderColor = 'black';
    }

    if (i[0].style.borderColor == 'black' && i[1].style.borderColor == 'black') {
        let owner = {};
        let guest = true;
        let guestName = capitalize(i[0].value) + ' ' + capitalize(i[1].value);
        let nbr = parseInt(document.getElementsByClassName('PopUpGuestContainer')[0].id);

        Cahier.setOwner(nbr, owner, guest, guestName);
        closePopUp({target: c.parentElement}, c.parentElement);
    }
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
