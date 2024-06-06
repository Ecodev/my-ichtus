function popBookable(bookableId, justPreview = true, nbr = 0, modal = openPopUp()) {
    Requests.getBookableInfos(nbr, bookableId, modal);

    if (modal == $('divTabCahierEquipmentBookableContainer')) {
        modal.innerHTML = '';
    }

    var pop = div(modal);
    pop.classList.add('Boxes');
    pop.classList.add('divTabCahierEquipmentElementsPopUp');

    if (modal != $('divTabCahierEquipmentBookableContainer')) {
        var close = div(pop);
        close.className = 'divPopUpClose';
        close.onclick = function () {
            closePopUp({target: modal}, modal);
        };
    } else {
        div(pop);
        newTab('divTabCahierEquipmentBookable');
    }

    var imgContainer = div(pop);

    var descriptionTitle = div(pop);
    descriptionTitle.innerHTML = 'Description';

    var description = div(pop); // description box

    var btn2 = div(pop);
    btn2.classList.add('Buttons');
    btn2.classList.add('ReturnButtons');
    btn2.style.visibility = 'hidden';
    btn2.innerHTML = 'Historique';

    if (!justPreview) {
        var btn = div(pop);
        btn.classList.add('Buttons', 'ValidateButtons');
        btn.innerHTML = 'Choisir';
        btn.setAttribute('tabindex', '0');
        btn.focus();
    } else {
        //  description.style.width = "660px";
    }

    var textsContainer = div(pop);
    textsContainer.className = 'divTabCahierEquipmentElementsContainerTextsContainer';

    div(textsContainer);
    div(textsContainer);
    div(textsContainer);
    div(textsContainer);
}

var eventListenerFunction;
function actualizePopBookable(nbr, bookable, bookings, elem) {
    elem.getElementsByTagName('div')[2].style.backgroundImage = Cahier.getImageUrl(bookable);

    elem.getElementsByClassName('divTabCahierEquipmentElementsPopUp')[0].getElementsByTagName('div')[3].innerHTML =
        bookable.description;

    var textsContainer = elem.getElementsByClassName('divTabCahierEquipmentElementsContainerTextsContainer')[0];

    if (bookable.code != null) {
        textsContainer.getElementsByTagName('div')[0].innerHTML = bookable.code;
    } else {
        textsContainer.getElementsByTagName('div')[0].innerHTML = '';
    }
    textsContainer.getElementsByTagName('div')[1].innerHTML = bookable.name.shorten(420, 20);

    if (options.showRemarks) div(textsContainer).innerHTML = bookable.remarks;
    else div(textsContainer);

    for (var i = 0; i < bookable.licenses.length; i++) {
        var lic = div(textsContainer);
        lic.innerHTML = "<asdf style='font-weight:bold'>License requise: </asdf >" + bookable.licenses[i].name;
    }

    var deltaT = 666; // anything higher than 13
    if (bookings.length != 0) {
        var bookableUsedWarning = false;

        if (currentTabElement.id != 'divTabCahier' && bookings.items[0].endDate == null) {
            // not available - used -> so !justPreview

            bookableUsedWarning = true;

            // 1.4 : don't show warning if editing the current booking
            if (Cahier.bookings[0].currentlyEditing != undefined) {
                for (let bookingId of Cahier.editedBooking.ids) {
                    if (bookings.items[0].id == bookingId) {
                        bookableUsedWarning = false;
                        break;
                    }
                }
            }
        }

        if (bookableUsedWarning) {
            var usedTxt = Cahier.getOwner(bookings.items[0], false);
            var dT = deltaTime(new Date(bookings.items[0].startDate));
            usedTxt += ' est parti ' + dT.text + ' avec cette embarcation !';
            deltaT = dT.time;

            var div2 = elem
                .getElementsByClassName('divTabCahierEquipmentElementsContainerTextsContainer')[0]
                .getElementsByTagName('div')[2];
            div2.innerHTML = usedTxt;
            div2.style.color = 'red';
            div2.style.backgroundImage = 'url(img/icons/alert.png)';
            div2.style.paddingLeft = '40px';
            div2.style.backgroundSize = '25px';
        } else {
            elem
                .getElementsByClassName('divTabCahierEquipmentElementsContainerTextsContainer')[0]
                .getElementsByTagName('div')[2].innerHTML =
                'Dernière utilisation le ' +
                new Date(bookings.items[0].startDate).getNiceDate() +
                '<br/> Par ' +
                Cahier.getOwner(bookings.items[0], false);
        }
        elem
            .getElementsByClassName('divTabCahierEquipmentElementsContainerTextsContainer')[0]
            .getElementsByTagName('div')[3].innerHTML = Cahier.getSingularOrPlural(bookings.length, ' sortie'); // oui ou non ?? $$ temp

        elem.getElementsByClassName('Buttons')[0].style.visibility = 'visible';
        elem.getElementsByClassName('Buttons')[0].addEventListener('click', function () {
            popBookableHistory(
                this.parentElement
                    .getElementsByClassName('divTabCahierEquipmentElementsContainerTextsContainer')[0]
                    .getElementsByTagName('div')[1].id,
            );
        });
    } else {
        // jamais utilisé
        elem
            .getElementsByClassName('divTabCahierEquipmentElementsContainerTextsContainer')[0]
            .getElementsByTagName('div')[3].innerHTML = 'Encore aucune sortie enregistrée';
        elem.getElementsByClassName('Buttons')[0].style.visibility = 'hidden';
    }

    if (elem.getElementsByClassName('ValidateButtons').length == 1) {
        // if !justPreview

        var choseFunction = function () {
            Cahier.addBookable(nbr, bookable, Object.assign({}, bookings.items[0]));
            newTab('divTabCahierEquipmentChoice');

            $('divTabCahierEquipmentChoice')
                .getElementsByClassName('divTabCahierEquipmentChoiceInputCodeContainer')[0]
                .getElementsByTagName('input')[0].value = '';
            $('divTabCahierEquipmentChoice')
                .getElementsByClassName('divTabCahierEquipmentChoiceInputCodeContainer')[0]
                .getElementsByTagName('input')[0]
                .nextElementSibling.nextElementSibling.children[0].classList.remove('activated');
        };

        if (deltaT < 13) {
            // big warning
            elem.getElementsByClassName('ValidateButtons')[0].classList.add('btnRed');
            elem.getElementsByClassName('ValidateButtons')[0].title = 'Cette embarcation est déjà utilisée';
            elem.getElementsByClassName('ValidateButtons')[0].addEventListener('click', function () {
                popAlertLessThan13Minutes(bookable, bookings.items[0], choseFunction);
            });
        } else {
            elem.getElementsByClassName('ValidateButtons')[0].addEventListener('click', choseFunction);
        }
    }

    //if (bookable.remarks != "" && options.showRemarks) {
    //    var bar = grayBar(elem.getElementsByClassName('divTabCahierEquipmentElementsContainerTextsContainer')[0]);
    //    bar.style.position = "absolute";
    //    bar.style.bottom = "-13px";
    //    bar.style.width = "100%";
    //}

    elem
        .getElementsByClassName('divTabCahierEquipmentElementsContainerTextsContainer')[0]
        .getElementsByTagName('div')[1].id = bookable.id;
}
