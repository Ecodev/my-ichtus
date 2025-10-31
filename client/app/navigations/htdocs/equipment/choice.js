import {$, closePopUp, div, input} from '../general/home.js';
import {Requests} from '../general/server-requests.js';
import {Cahier} from '../cahier/methods.js';
import {newTab} from '../general/screen.js';

export function loadCahierEquipmentChoice(
    loc = $('divTabCahierEquipmentChoice').getElementsByClassName('MaterielChoiceContainer')[0],
    nbr = 0,
) {
    let isTab = true;
    if (loc != $('divTabCahierEquipmentChoice').getElementsByClassName('MaterielChoiceContainer')[0]) {
        isTab = false;
    }

    const container = div(loc);
    container.classList.add('divTabCahierEquipmentChoiceContainer');

    const c = div(container);
    c.classList.add('divTabCahierEquipmentChoiceInputCodeContainer');

    const i = input(c, 'Taper un code...');
    i.onkeyup = function (event) {
        if (event.keyCode == 13) {
            Requests.getBookableByCode(this, nbr);
        }
        if (this.value != '') {
            this.nextElementSibling.nextElementSibling.children[0].classList.add('activated');
        } else {
            this.nextElementSibling.nextElementSibling.children[0].classList.remove('activated');
        }
    };

    if (!isTab) {
        i.focus();
    }

    div(c);

    const btn = div(div(c));
    btn.classList.add('ValidateButtons', 'Buttons');
    btn.title = 'Choisir cette embarcation';
    btn.onclick = function () {
        Requests.getBookableByCode(this.parentElement.previousElementSibling.previousElementSibling, nbr);
    };

    div(container).innerHTML = 'Par exemple: S101';

    div(container).innerHTML = 'Ou';

    const btnContainer = div(container);

    const btn1 = div(btnContainer);
    btn1.innerHTML = 'Prendre du matériel personnel';
    btn1.title = 'Prendre du matériel personnel';
    btn1.style.fontSize = '19px';

    if (isTab) {
        btn1.onclick = function () {
            let t = true;
            for (let k = 0; k < Cahier.bookings[0].bookables.length; k++) {
                if (Cahier.bookings[0].bookables[k].id == 0) {
                    // matériel personnel
                    t = false;
                    break;
                }
            }
            if (t) {
                Cahier.addBookable(nbr);
            }
        };
    } else {
        btn1.onclick = function () {
            Cahier.addBookable(nbr);
            closePopUp('last');
        };
    }

    btn1.classList.add('NormalButtons', 'Buttons');

    const btn2 = div(btnContainer);
    btn2.innerHTML = 'Voir la liste du matériel';
    if (isTab) {
        btn2.onclick = function () {
            newTab('divTabCahierEquipmentCategories');
        };
    } else {
        // btn2.onclick = function () { alert('a'); };
        btn2.style.backgroundColor = 'lightgray';
        btn2.style.opacity = 0.5;
        btn2.style.cursor = 'no-drop';
    }
    btn2.classList.add('NormalButtons', 'Buttons');
    btn2.title = 'Voir la liste du matériel';
}
