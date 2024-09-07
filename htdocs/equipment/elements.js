import {$, deltaTime, div} from '../general/home.js';
import {Cahier} from '../cahier/methods.js';
import {popAlertLessThan13Minutes} from '../general/pop-alert.js';
import {popBookable} from './pop-bookable.js';
import {categories} from './categories.js';

let currentBookables;
export function loadElements(bookables, nbr = 0) {
    currentBookables = bookables;

    document.getElementsByClassName('divTabCahierEquipmentElementsContainer')[0].innerHTML = '';

    let codes = [];
    for (let i = 0; i < Cahier.bookings[nbr].bookables.length; i++) {
        codes.push(Cahier.bookings[nbr].bookables[i].id);
    }

    for (let j = 0; j < bookables.length; j++) {
        let container = document.createElement('div');
        container.id = j;

        // 1.4 : make fake no used (actually already used in the current booking that is being edited...)
        if (bookables[j].used === true && Cahier.bookings[0].currentlyEditing != undefined) {
            for (let bookingId of Cahier.editedBooking.ids) {
                if (bookables[j].lastBooking.id == bookingId) {
                    bookables[j].used = false;
                    break;
                }
            }
        }

        let dT;
        if (bookables[j].used === true) {
            container.classList.add('used');
            container.title = 'Cette embarcation est déjà utilisée';
            dT = deltaTime(new Date(bookables[j].lastBooking.startDate), new Date(), false);
            bookables[j].lessThan13Minutes = dT.time < 13 ? true : false;
        } else bookables[j].lessThan13Minutes = false;

        let x = codes.findIndex(bookables[j].id);

        if (x !== -1) {
            // found something
            container.classList.add('selected');
            container.onclick = function (event) {
                if (!event.target.classList.contains('infoJS')) {
                    // pas cliqué sur le bouton info
                    Cahier.removeBookable(nbr, bookables[this.id]);
                    actualizeElements();
                }
            };
        } else {
            container.onclick = function (event) {
                if (!event.target.classList.contains('infoJS')) {
                    // pas cliqué sur le bouton info

                    if (bookables[this.id].lessThan13Minutes) {
                        // big warning
                        popAlertLessThan13Minutes(
                            bookables[this.id],
                            bookables[this.id].lastBooking,
                            function (_bookable) {
                                Cahier.addBookable(0, _bookable);
                                actualizeElements();
                            },
                        );
                    } else {
                        Cahier.addBookable(0, bookables[this.id]);
                        actualizeElements();
                    }
                }
            };
        }

        document.getElementsByClassName('divTabCahierEquipmentElementsContainer')[0].appendChild(container);

        let secondContainer = document.createElement('div');
        container.appendChild(secondContainer);

        let size = document.createElement('div');

        if (bookables[j].code != null) {
            size.innerHTML = bookables[j].code;
            if (bookables[j].code.length > 4) {
                size.style.fontSize = '17px';
            }
        } else {
            size.innerHTML = '';
        }

        secondContainer.appendChild(size);

        let bottom = document.createElement('div');
        secondContainer.appendChild(bottom);

        let brand = div(bottom);
        brand.innerHTML = bookables[j].name.shorten(160 * 2, 20);

        let background = div(secondContainer);
        background.style.backgroundImage = Cahier.getImageUrl(bookables[j]);

        let selection = div(secondContainer);

        let info = div(secondContainer);
        info.id = bookables[j].id;
        info.classList.add('infoJS');
        info.onclick = function () {
            popBookable(this.id);
        };

        if (bookables[j].licenses.length > 0) {
            div(secondContainer).title = bookables[j].licenses[0].name;
        }

        if (bookables[j].used === true) {
            div(container).innerHTML = 'Déjà utilisé';
            div(container).innerHTML = dT.text;
        }
    }
    if (bookables.length == 0) {
        let d = div(document.getElementsByClassName('divTabCahierEquipmentElementsContainer')[0]);
        d.innerHTML = 'Aucun résultat';
    }
}

export function actualizeElements() {
    let bookables = currentBookables;

    let codes = [];
    for (let i = 0; i < Cahier.bookings[0].bookables.length; i++) {
        codes.push(Cahier.bookings[0].bookables[i].id);
    }

    let containers = document.getElementsByClassName('divTabCahierEquipmentElementsContainer')[0].children;

    for (let j = 0; j < containers.length; j++) {
        containers[j].classList.remove('selected');
    }

    for (let k = 0; k < containers.length; k++) {
        let container = containers[k];

        if (codes.findIndex(bookables[k].id) !== -1) {
            // found something
            container.classList.add('selected');
            container.onclick = function (event) {
                if (!event.target.classList.contains('infoJS')) {
                    // pas cliqué sur le bouton info
                    Cahier.removeBookable(0, bookables[this.id]);
                    actualizeElements();
                }
            };
        } else {
            container.onclick = function (event) {
                if (!event.target.classList.contains('infoJS')) {
                    // pas cliqué sur le bouton info

                    if (bookables[this.id].lessThan13Minutes) {
                        // big warning
                        popAlertLessThan13Minutes(
                            bookables[this.id],
                            bookables[this.id].lastBooking,
                            function (_bookable) {
                                Cahier.addBookable(0, _bookable);
                                actualizeElements();
                            },
                        );
                    } else {
                        Cahier.addBookable(0, bookables[this.id]);
                        actualizeElements();
                    }
                }
            };
        }
    }
}

export function clickSortIcon(elem) {
    if (elem.style.backgroundImage == 'url("img/icons/sort-desc.png")') {
        elem.style.backgroundImage = 'url("img/icons/sort-asc.png")';
    } else {
        elem.style.backgroundImage = 'url("img/icons/sort-desc.png")';
    }
}

export function changeSelectCategorie(elem) {
    let image = 'url(img/icons/no-result.png)';
    for (let category of categories) {
        if (category.value == elem.value) {
            image = 'url(img/categorie/' + category.image + ')';
            break;
        }
    }
    $('divTabCahierEquipmentElementsSelectCategorie').getElementsByTagName('div')[0].style.backgroundImage = image;
}
