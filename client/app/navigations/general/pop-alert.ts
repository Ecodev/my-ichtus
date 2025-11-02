import {$, closePopUp, deltaTime, div, grayBar, openPopUp} from './home';
import {newTab} from './screen';
import {Cahier} from '../cahier/methods';
import {popCahierInfos} from '../infos/pop-infos';
import type {Bookable, BookableWithLastBooking, Booking, User} from '../types';

export function popAlert(txt = 'haha ahah ahah '): void {
    const elem = openPopUp();

    const container = div(elem);
    container.classList.add('PopUpAlertContainer');
    container.classList.add('Boxes');

    const close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem});
    };

    const d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = '!';

    grayBar(container, 5);

    const t = div(container);
    t.innerHTML = txt;
}

export function popAlertLate(): void {
    const elem = openPopUp();

    const container = div(elem);
    container.classList.add('PopUpAlertContainer', 'booking');
    container.classList.add('Boxes');
    container.style.width = '495px';
    container.style.height = '180px';

    const close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem});
    };

    const d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = 'Heures tardives';

    grayBar(container, 5);

    const t = div(container);
    t.innerHTML = 'Pour ta sécurité, pense à rentrer avant le coucher du soleil.';

    const btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';

    const btn = div(btnContainer);
    btn.classList.add('Buttons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Ok';
    btn.addEventListener('click', function () {
        closePopUp('last');
        $('divTabCahierMember').getElementsByTagName('input')[0].focus();
    });
}

export function popAlertAlreadyHavingABooking(_owner: User): void {
    const elem = openPopUp();

    const container = div(elem);
    container.classList.add('PopUpAlertContainer', 'booking');
    container.classList.add('Boxes');

    const close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem});
    };

    const d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = '!';

    grayBar(container, 5);

    const t = div(container);
    t.innerHTML = 'Il semblerait que vous ayez déjà une sortie en cours';

    const btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';

    let btn = div(btnContainer);
    btn.classList.add('Buttons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Voir les sorties';
    btn.addEventListener('click', function () {
        newTab('divTabCahier');
        closePopUp('last');
    });

    btn = div(btnContainer);
    btn.classList.add('Buttons', 'ValidateButtons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Continuer';
    btn.addEventListener('click', function () {
        closePopUp('last');
        Cahier.setOwner(0, _owner, true);
    });
}

export function popAlertNoWelcomeSession(_owner: User): void {
    const elem = openPopUp();

    const container = div(elem);
    container.classList.add('PopUpAlertContainer', 'booking');
    container.classList.add('Boxes');

    const close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem});
    };

    const d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = "Pas suivi de séance d'accueil";

    grayBar(container, 5);

    const t = div(container);
    t.innerHTML = "Il semblerait que vous n'ayez pas encore suivi de séance d'accueil.";
    t.style.minHeight = '60px';

    const btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';

    let btn = div(btnContainer);
    btn.classList.add('Buttons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Annuler';
    btn.addEventListener('click', function () {
        newTab('divTabCahier');
        closePopUp('last');
    });

    btn = div(btnContainer);
    btn.classList.add('Buttons', 'ValidateButtons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Continuer';
    btn.classList.add('btnRed');
    //_owner.welcomeSessionDate = "fake"; //(new Date()).toISOString(); // fake welcome sesion date
    btn.addEventListener('click', function () {
        closePopUp('last');
        Cahier.setOwner(0, {..._owner, welcomeSessionDate: 'fake'});
    });
    //btn.addEventListener("click", function () { Cahier.setOwner(0, _owner); closePopUp("last"); });
}

export function popAlertLessThan13Minutes(
    _bookable: Bookable,
    _booking: Booking,
    _choseFunction: (bookable: Bookable) => void,
): void {
    const elem = openPopUp();

    const txt =
        '<b>' +
        Cahier.getOwner(_booking, false) +
        '</b> est parti ' +
        "<red style='color:red'>" +
        deltaTime(new Date(_booking.startDate)).text +
        ' </red> avec le <b>' +
        _bookable.code +
        '</b> !';

    const container = div(elem);
    container.style.height = '215px';
    container.classList.add('PopUpAlertContainer', 'booking');
    container.classList.add('Boxes');

    const close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem});
    };

    const d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = 'Embarcation déjà utilisée';

    grayBar(container, 5);

    const t = div(container);
    t.innerHTML = txt + "<br>Êtes-vous sûr que l'embarcation est disponible ?";
    t.style.minHeight = '80px';

    const a = div(container);
    a.style.position = 'absolute';
    a.style.left = '12px';
    a.style.top = '10px';
    a.style.backgroundImage = 'url(assets/navigations/icons/alert.png)';
    a.style.backgroundSize = '30px';
    a.style.width = '30px';
    a.style.height = '30px';

    const btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';

    let btn = div(btnContainer);
    btn.classList.add('Buttons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Annuler';
    btn.style.fontSize = '20px';
    btn.addEventListener('click', function () {
        closePopUp('last');
    });

    btn = div(btnContainer);
    btn.classList.add('Buttons', 'ValidateButtons');
    btn.style.display = 'inline-block';
    btn.style.backgroundImage = 'url(assets/navigations/icons/validated.png)';
    btn.innerHTML = 'Choisir';
    btn.style.fontSize = '20px';
    btn.classList.add('btnRed');

    btn.addEventListener('click', function () {
        closePopUp('last');
        _choseFunction(_bookable);
    });
}

export function popAlertBookablesHaveJustBeenBooked(_bookablesNotAvailable: BookableWithLastBooking[]): void {
    const elem = openPopUp();

    //console.log("_bookablesNotAvailable", _bookablesNotAvailable);

    let txt = '';

    for (const b of _bookablesNotAvailable) {
        txt +=
            '<b>' +
            Cahier.getOwner(b.lastBooking!, false) +
            '</b> est parti ' +
            "<red style='color:red'>" +
            deltaTime(new Date(b.lastBooking!.startDate)).text +
            ' </red> avec le <b>' +
            b.code +
            '</b> !<br>';
    }
    txt +=
        _bookablesNotAvailable.length == 1
            ? "Êtes-vous sûr que l'embarcation est disponible ?"
            : 'Êtes-vous sûr que les embarcations sont disponibles ?';

    const container = div(elem);
    container.style.height = 'auto';
    container.style.minHeight = '215px';
    container.style.maxHeight = '80%';
    container.style.width = 'auto';
    container.style.minWidth = '530px';
    container.classList.add('PopUpAlertContainer', 'booking');
    container.classList.add('Boxes');

    const close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem});
    };

    const d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = _bookablesNotAvailable.length == 1 ? 'Embarcation utilisée !' : 'Embarcations utilisées !';

    grayBar(container, 5);

    const t = div(container);
    t.innerHTML = txt;
    t.style.minHeight = '80px';

    const btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';
    btnContainer.style.marginTop = '5px';

    let btn = div(btnContainer);
    btn.classList.add('Buttons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Annuler';
    btn.style.fontSize = '20px';
    btn.addEventListener('click', function () {
        closePopUp('last');
    });

    btn = div(btnContainer);
    btn.classList.add('Buttons', 'ValidateButtons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Continuer';
    btn.style.fontSize = '20px';
    btn.classList.add('btnRed');

    btn.addEventListener('click', function () {
        closePopUp('last');
        Cahier.confirm();
    });
}

export function popAlertMoreBookablesThanParticipants(bookables: number, participants: number): void {
    const elem = openPopUp();

    const container = div(elem);
    container.classList.add('PopUpAlertContainer', 'bookable');
    container.classList.add('Boxes');

    const close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem});
    };

    const d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = "Trop d'embarcations";

    grayBar(container, 5);

    const t = div(container);
    t.innerHTML =
        'Vous avez choisi ' +
        bookables +
        ' embarcations pour seulement ' +
        Cahier.getSingularOrPlural(participants, ' participant') +
        ' !';

    const btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';

    const btn = div(btnContainer);
    btn.classList.add('Buttons', 'ValidateButtons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Modifier le nbr de participants';
    btn.addEventListener('click', function () {
        closePopUp('last');
        popCahierInfos(0);
    });
}

export function popAlertTooManyParticipants(): void {
    const elem = openPopUp();

    const container = div(elem);
    container.classList.add('PopUpAlertContainer', 'bookable');
    container.classList.add('Boxes');

    const close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem});
    };

    const d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = 'Trop de participants';

    grayBar(container, 5);

    const t = div(container);
    t.innerHTML = 'Vous pouvez au maximum annoncer 15 participants en une sortie !';

    const btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';

    const btn = div(btnContainer);
    btn.classList.add('Buttons', 'ValidateButtons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Modifier le nbr de participants';
    btn.addEventListener('click', function () {
        closePopUp('last');
        popCahierInfos(0);
    });
}

export function popAlertTooManyBookables(): void {
    const elem = openPopUp();

    const container = div(elem);
    container.classList.add('PopUpAlertContainer', 'bookable');
    container.classList.add('Boxes');

    const close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem});
    };

    const d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = "Trop d'embarcations";

    grayBar(container, 5);

    const t = div(container);
    t.innerHTML = 'Vous pouvez au maximum annoncer 10 embarcations en une sortie !';

    const btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';

    const btn = div(btnContainer);
    btn.classList.add('Buttons', 'ValidateButtons');
    btn.style.width = '250px';
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Modifier les embarcations';
    btn.addEventListener('click', function () {
        closePopUp('last');
        newTab('divTabCahierEquipmentChoice');
    });
}

export function popAlertMissingLicense(_license: Bookable['licenses'][0], _bookable: Bookable): void {
    const elem = openPopUp();

    const container = div(elem);
    container.classList.add('PopUpAlertContainer', 'booking');
    container.classList.add('Boxes');

    const close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem});
    };

    const d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = 'Certification manquante !';

    grayBar(container, 5);

    const t = div(container);
    t.innerHTML =
        "Il semblerait que vous n'ayez pas la certification <i style='font-weight:bold'>" +
        _license.name +
        " </i> pour le <asdf style='font-weight:bold'>" +
        _bookable.name +
        '</asdf>';
    t.style.minHeight = '60px';

    const btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';

    const btn = div(btnContainer);
    btn.classList.add('Buttons', 'ValidateButtons');
    btn.style.width = '250px';
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Modifier les embarcations';
    btn.style.backgroundImage = 'none';
    btn.addEventListener('click', function () {
        closePopUp('last');
        newTab('divTabCahierEquipmentChoice');
    });
}
