import {closePopUp, div, grayBar, input, openPopUp, options} from '../general/home.js';
import {Requests} from '../general/server-requests.js';

export function popLogin() {
    let elem = openPopUp();

    let container;
    container = div(elem);
    container.classList.add('PopUpLoginContainer');
    container.classList.add('Boxes');

    let close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem}, elem);
    };

    let d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = 'Connexion';

    grayBar(container, 5);

    div(container);

    let i = input(container);
    i.type = 'password';
    i.placeholder = 'Mot de passe';
    i.addEventListener('keyup', function (event) {
        if (event.keyCode == 13) {
            Requests.login(this.value);
        }
    });

    let b = div(container);
    b.classList.add('Buttons');
    b.classList.add('ValidateButtons');
    b.innerHTML = 'Connexion';
    b.addEventListener('click', function () {
        Requests.login(this.parentElement.getElementsByTagName('input')[0].value);
    });

    setTimeout(function () {
        i.focus();

        setTimeout(function () {
            if (i.value != '' && options.automaticConnexion) {
                console.warn('Connexion automatique');
                Requests.login(i.value);
            } else {
                console.warn('Pas de connexion automatique');
            }
        }, 50);
    }, 800);
}
