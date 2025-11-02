import {$, deltaTime, div, shorten} from '../general/home';
import {Cahier} from '../cahier/methods';
import {popAlertLessThan13Minutes} from '../general/pop-alert';
import {popBookable} from './pop-bookable';
import {categories} from './categories';
import type {BookableWithExtra} from '../types';

let currentBookables: BookableWithExtra[];
export function loadElements(bookables: BookableWithExtra[], nbr = 0): void {
    currentBookables = bookables;

    document.getElementsByClassName('divTabCahierEquipmentElementsContainer')[0].innerHTML = '';

    const codes = [];
    for (const item of Cahier.bookings[nbr].bookables) {
        codes.push(item.id);
    }

    for (let j = 0; j < bookables.length; j++) {
        const container = document.createElement('div');
        container.id = '' + j;

        // 1.4 : make fake no used (actually already used in the current booking that is being edited...)
        const bookable = bookables[j];
        if (bookable.used && Cahier.bookings[0].currentlyEditing != undefined) {
            for (const bookingId of Cahier.editedBooking.ids) {
                if (bookable.lastBooking && bookable.lastBooking.id == bookingId) {
                    bookable.used = false;
                    break;
                }
            }
        }

        let dT;
        if (bookable.used) {
            container.classList.add('used');
            container.title = 'Cette embarcation est déjà utilisée';
            dT = deltaTime(new Date(bookable.lastBooking!.startDate), new Date(), false);
            bookable.lessThan13Minutes = dT.time < 13;
        } else bookable.lessThan13Minutes = false;

        const x = codes.findIndex(code => code == bookable.id);

        if (x !== -1) {
            // found something
            container.classList.add('selected');
            container.onclick = function (event) {
                if (!(event.target as HTMLElement).classList.contains('infoJS')) {
                    // pas cliqué sur le bouton info
                    Cahier.removeBookable(nbr, bookables[+(this as HTMLElement).id]);
                    actualizeElements();
                }
            };
        } else {
            container.onclick = function (event) {
                if (!(event.target as HTMLElement).classList.contains('infoJS')) {
                    // pas cliqué sur le bouton info

                    const id = +(this as HTMLElement).id;
                    if (bookables[id].lessThan13Minutes) {
                        // big warning
                        popAlertLessThan13Minutes(bookables[id], bookables[id].lastBooking!, function (_bookable) {
                            Cahier.addBookable(0, _bookable);
                            actualizeElements();
                        });
                    } else {
                        Cahier.addBookable(0, bookables[id]);
                        actualizeElements();
                    }
                }
            };
        }

        document.getElementsByClassName('divTabCahierEquipmentElementsContainer')[0].appendChild(container);

        const secondContainer = document.createElement('div');
        container.appendChild(secondContainer);

        const size = document.createElement('div');

        if (bookable.code != null) {
            size.innerHTML = bookable.code;
            if (bookable.code.length > 4) {
                size.style.fontSize = '17px';
            }
        } else {
            size.innerHTML = '';
        }

        secondContainer.appendChild(size);

        const bottom = document.createElement('div');
        secondContainer.appendChild(bottom);

        const brand = div(bottom);
        brand.innerHTML = shorten(bookable.name, 160 * 2, 20);

        const background = div(secondContainer);
        background.style.backgroundImage = Cahier.getImageUrl(bookable);

        div(secondContainer);

        const info = div(secondContainer);
        info.id = bookable.id;
        info.classList.add('infoJS');
        info.onclick = function () {
            popBookable((this as HTMLElement).id);
        };

        if (bookable.licenses.length > 0) {
            div(secondContainer).title = bookable.licenses[0].name;
        }

        if (bookable.used && dT) {
            div(container).innerHTML = 'Déjà utilisé';
            div(container).innerHTML = dT.text;
        }
    }
    if (bookables.length == 0) {
        const d = div(document.getElementsByClassName('divTabCahierEquipmentElementsContainer')[0]);
        d.innerHTML = 'Aucun résultat';
    }
}

export function actualizeElements(): void {
    const bookables = currentBookables;

    const codes = [];
    for (const item of Cahier.bookings[0].bookables) {
        codes.push(item.id);
    }

    const containers = document.getElementsByClassName('divTabCahierEquipmentElementsContainer')[0]
        .children as HTMLCollectionOf<HTMLElement>;

    for (const container of containers) {
        container.classList.remove('selected');
    }

    for (let k = 0; k < containers.length; k++) {
        const container = containers[k];

        if (codes.findIndex(code => code == bookables[k].id) !== -1) {
            // found something
            container.classList.add('selected');
            container.onclick = function (event) {
                if (!(event.target as HTMLElement).classList.contains('infoJS')) {
                    // pas cliqué sur le bouton info
                    Cahier.removeBookable(0, bookables[+(this as HTMLElement).id]);
                    actualizeElements();
                }
            };
        } else {
            container.onclick = function (event) {
                if (!(event.target as HTMLElement).classList.contains('infoJS')) {
                    // pas cliqué sur le bouton info

                    const id = +(this as HTMLElement).id;
                    if (bookables[id].lessThan13Minutes) {
                        // big warning
                        popAlertLessThan13Minutes(bookables[id], bookables[id].lastBooking!, function (_bookable) {
                            Cahier.addBookable(0, _bookable);
                            actualizeElements();
                        });
                    } else {
                        Cahier.addBookable(0, bookables[id]);
                        actualizeElements();
                    }
                }
            };
        }
    }
}

export function clickSortIcon(elem: HTMLElement): void {
    if (elem.style.backgroundImage == 'url("assets/navigations/icons/sort-desc.png")') {
        elem.style.backgroundImage = 'url("assets/navigations/icons/sort-asc.png")';
    } else {
        elem.style.backgroundImage = 'url("assets/navigations/icons/sort-desc.png")';
    }
}

export function changeSelectCategorie(elem: HTMLSelectElement): void {
    let image = 'url(assets/navigations/icons/no-result.png)';
    for (const category of categories) {
        if (category.value == elem.value) {
            image = 'url(assets/navigations/categorie/' + category.image + ')';
            break;
        }
    }
    $('divTabCahierEquipmentElementsSelectCategorie').getElementsByTagName('div')[0].style.backgroundImage = image;
}
