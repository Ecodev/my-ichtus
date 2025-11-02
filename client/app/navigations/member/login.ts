import {closePopUp, div, grayBar, input, openPopUp, options} from '../general/home';
import {server} from '../general/server';

export function popLogin(): void {
    const elem = openPopUp();

    const container = div(elem);
    container.classList.add('PopUpLoginContainer');
    container.classList.add('Boxes');

    const close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem});
    };

    const d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = 'Connexion';

    grayBar(container, 5);

    div(container);

    const i = input(container);
    i.type = 'password';
    i.placeholder = 'Mot de passe';
    i.addEventListener('keyup', function (event) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        if (event.keyCode == 13) {
            server.userService.login(this.value);
        }
    });

    const b = div(container);
    b.classList.add('Buttons');
    b.classList.add('ValidateButtons');
    b.innerHTML = 'Connexion';
    b.addEventListener('click', function () {
        server.userService.login(this.parentElement!.getElementsByTagName('input')[0].value);
    });

    setTimeout(function () {
        i.focus();

        setTimeout(function () {
            if (i.value != '' && options.automaticConnexion) {
                console.warn('Connexion automatique');
                server.userService.login(i.value);
            } else {
                console.warn('Pas de connexion automatique');
            }
        }, 50);
    }, 800);
}
