import {$, div, input} from '../general/home';
import {server} from '../general/server';
import {Cahier} from '../cahier/methods';
import {newTab} from '../general/screen';

export function loadCahierEquipmentChoice(): void {
    const loc = $('divTabCahierEquipmentChoice').getElementsByClassName('MaterielChoiceContainer')[0];
    const nbr = 0;

    const container = div(loc);
    container.classList.add('divTabCahierEquipmentChoiceContainer');

    const c = div(container);
    c.classList.add('divTabCahierEquipmentChoiceInputCodeContainer');

    const i = input(c, 'Taper un code...');
    i.onkeyup = function (event) {
        const elem = this as HTMLInputElement;
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        if (event.keyCode == 13) {
            server.bookableService.getBookableByCode(elem, nbr);
        }
        if (elem.value != '') {
            elem.nextElementSibling!.nextElementSibling!.children[0].classList.add('activated');
        } else {
            elem.nextElementSibling!.nextElementSibling!.children[0].classList.remove('activated');
        }
    };

    div(c);

    const btn = div(div(c));
    btn.classList.add('ValidateButtons', 'Buttons');
    btn.title = 'Choisir cette embarcation';
    btn.onclick = function () {
        server.bookableService.getBookableByCode(
            (this as HTMLDivElement).parentElement!.previousElementSibling!.previousElementSibling as HTMLInputElement,
            nbr,
        );
    };

    div(container).innerHTML = 'Par exemple: S101';

    div(container).innerHTML = 'Ou';

    const btnContainer = div(container);

    const btn1 = div(btnContainer);
    btn1.innerHTML = 'Prendre du matériel personnel';
    btn1.title = 'Prendre du matériel personnel';
    btn1.style.fontSize = '19px';

    btn1.onclick = function () {
        let t = true;
        for (const bookable of Cahier.bookings[0].bookables) {
            if (bookable.id == '0') {
                // matériel personnel
                t = false;
                break;
            }
        }
        if (t) {
            Cahier.addBookable(nbr, Cahier.personalBookable);
        }
    };

    btn1.classList.add('NormalButtons', 'Buttons');

    const btn2 = div(btnContainer);
    btn2.innerHTML = 'Voir la liste du matériel';
    btn2.onclick = function () {
        newTab('divTabCahierEquipmentCategories');
    };
    btn2.classList.add('NormalButtons', 'Buttons');
    btn2.title = 'Voir la liste du matériel';
}
