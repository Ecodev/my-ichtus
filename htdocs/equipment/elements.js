var currentBookables;
function loadElements(bookables, nbr = 0) {
    currentBookables = bookables;

    document.getElementsByClassName('divTabCahierEquipmentElementsContainer')[0].innerHTML = '';

    var codes = [];
    for (var i = 0; i < Cahier.bookings[nbr].bookables.length; i++) {
        codes.push(Cahier.bookings[nbr].bookables[i].id);
    }

    for (var i = 0; i < bookables.length; i++) {
        container = document.createElement('div');
        container.id = i;

        // 1.4 : make fake no used (actually already used in the current booking that is being edited...)
        if (bookables[i].used === true && Cahier.bookings[0].currentlyEditing != undefined) {
            for (let bookingId of Cahier.editedBooking.ids) {
                if (bookables[i].lastBooking.id == bookingId) {
                    bookables[i].used = false;
                    break;
                }
            }
        }

        var dT;
        if (bookables[i].used === true) {
            container.classList.add('used');
            container.title = 'Cette embarcation est déjà utilisée';
            dT = deltaTime(new Date(bookables[i].lastBooking.startDate), new Date(), false);
            bookables[i].lessThan13Minutes = dT.time < 13 ? true : false;
        } else bookables[i].lessThan13Minutes = false;

        var x = codes.findIndex(bookables[i].id);

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

        var secondContainer = document.createElement('div');
        container.appendChild(secondContainer);

        var size = document.createElement('div');

        if (bookables[i].code != null) {
            size.innerHTML = bookables[i].code;
            if (bookables[i].code.length > 4) {
                size.style.fontSize = '17px';
            }
        } else {
            size.innerHTML = '';
        }

        secondContainer.appendChild(size);

        var bottom = document.createElement('div');
        secondContainer.appendChild(bottom);

        var brand = div(bottom);
        brand.innerHTML = bookables[i].name.shorten(160 * 2, 20);

        var background = div(secondContainer);
        background.style.backgroundImage = Cahier.getImageUrl(bookables[i]);

        var selection = div(secondContainer);

        var info = div(secondContainer);
        info.id = bookables[i].id;
        info.classList.add('infoJS');
        info.onclick = function () {
            popBookable(this.id);
        };

        if (bookables[i].licenses.length > 0) {
            div(secondContainer).title = bookables[i].licenses[0].name;
        }

        if (bookables[i].used === true) {
            div(container).innerHTML = 'Déjà utilisé';
            div(container).innerHTML = dT.text;
        }
    }
    if (bookables.length == 0) {
        var d = div(document.getElementsByClassName('divTabCahierEquipmentElementsContainer')[0]);
        d.innerHTML = 'Aucun résultat';
    }
}

function actualizeElements() {
    var bookables = currentBookables;

    var codes = [];
    for (var i = 0; i < Cahier.bookings[0].bookables.length; i++) {
        codes.push(Cahier.bookings[0].bookables[i].id);
    }

    var containers = document.getElementsByClassName('divTabCahierEquipmentElementsContainer')[0].children;

    for (var i = 0; i < containers.length; i++) {
        containers[i].classList.remove('selected');
    }

    for (var i = 0; i < containers.length; i++) {
        var container = containers[i];

        if (codes.findIndex(bookables[i].id) !== -1) {
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

function clickSortIcon(elem) {
    if (elem.style.backgroundImage == 'url("img/icons/sort-desc.png")') {
        elem.style.backgroundImage = 'url("img/icons/sort-asc.png")';
    } else {
        elem.style.backgroundImage = 'url("img/icons/sort-desc.png")';
    }
}

function changeSelectCategorie(elem) {
    image = 'url(img/icons/no-result.png)';
    for (let category of categories) {
        if (category.value == elem.value) {
            image = 'url(img/categorie/' + category.image + ')';
            break;
        }
    }
    $('divTabCahierEquipmentElementsSelectCategorie').getElementsByTagName('div')[0].style.backgroundImage = image;
}
