import {$, div} from '../general/home';
import {popBookable} from '../equipment/pop-bookable';
import {Cahier} from './methods';
import {tabs} from '../general/screen';

export function actualizeBookableList(): void {
    const bookables = Cahier.bookings[0].bookables;

    const child = $('divTabCahierTopList').children[0] as HTMLElement;
    child.innerHTML = '';
    child.style.opacity = '1';
    $('divTabCahierTopList').style.visibility = 'visible';

    document
        .getElementsByClassName('divTabCahierEquipmentChoiceContainer')[0]
        .children[3].children[0].classList.remove('buttonNonActive');

    for (let i = 0; i < bookables.length; i++) {
        const d = div(child);
        d.id = '' + i;

        if (Cahier.bookings[0].bookables[i].id != 0) {
            // matériel personnel
            d.onclick = function (event) {
                if (
                    event.target == (this as HTMLElement).children[0] ||
                    event.target == (this as HTMLElement).children[2] ||
                    event.target == (this as HTMLElement).children[3]
                ) {
                    popBookable(Cahier.bookings[0].bookables[(this as HTMLElement).id].id);
                }
            };
        } else {
            document
                .getElementsByClassName('divTabCahierEquipmentChoiceContainer')[0]
                .children[3].children[0].classList.add('buttonNonActive');
            d.classList.add('PersonalSail');
        }

        const img = div(d);
        img.style.backgroundImage = Cahier.getImageUrl(Cahier.bookings[0].bookables[i]);

        const close = div(d);
        close.id = '' + i;
        close.onclick = function () {
            Cahier.removeBookable(0, Cahier.bookings[0].bookables[(this as HTMLElement).id]);
        };

        const code = div(d);

        if (bookables[i].code != null) {
            if (bookables[i].code.length > 4) {
                code.style.fontSize = '12px';
            }
            code.innerHTML = bookables[i].code;
        } else {
            code.innerHTML = '';
        }

        if (bookables[i].available == false) {
            div(d); // alert
            //  code.style.color = "red";
        }
    }

    if (bookables.length == 0) {
        child.style.opacity = '0';
        $('divTabCahierTopList').style.visibility = 'hidden';

        for (const item of tabs) {
            if (item.ListBar) {
                $(item.id).classList.remove('listBarActive');
            }
        }
        $('btnNext').classList.remove('activated');
    } else {
        for (const item of tabs) {
            if (item.ListBar) {
                $(item.id).classList.add('listBarActive');
            }
        }
        $('btnNext').classList.add('activated');
    }
}
