import {$, closePopUp, deleteObjects, div, grayBar, openPopUp, options} from '../general/home.js';
import {Requests} from '../general/server-requests.js';
import {newTab} from '../general/screen.js';
import {popCahierInfos} from '../infos/pop-infos.js';
import {Cahier, getEndCommentFromBooking, getStartCommentFromBooking} from './methods.js';
import {popBookable} from '../equipment/pop-bookable.js';

// popBookings
export function loadConfirmation() {
    const elem = $('divTabConfirmationOneBookingContainer');
    openBooking('confirmation', elem);
}

export function popBooking(_booking) {
    // without all bookables... so if the booking is not complete
    const elem = openPopUp();
    openBooking('infos', elem);
    Requests.getBookingWithBookablesInfos(_booking, 'infos', elem);
}

export function popBookingInfos(_booking) {
    const elem = openPopUp();
    openBooking('infos', elem);
    actualizePopBooking(_booking, 'infos', elem);
}

export function popBookingFinish(_booking) {
    const elem = openPopUp();
    openBooking('finish', elem);
    actualizePopBooking(_booking, 'finish', elem);
}

function openBooking(which = 'confirmation', elem = $('divTabConfirmationOneBookingContainer')) {
    const fields = [
        'Responsable',
        'Heure de départ',
        "Heure d'arrivée",
        'Embarcations',
        'Nbr de participants',
        'Destination',
        'Commentaire dép.',
        'Commentaire arr.',
    ];
    const images = [
        'icons/responsible',
        'icons/start',
        'icons/end',
        'icons/sail',
        'icons/participant-count',
        'icons/destination',
        'icons/start-comment',
        'icons/end-comment',
    ];

    let container;

    // TITLE
    if (which == 'confirmation') {
        elem.innerHTML = ''; // empty elem
        container = div(elem);
        container.style.position = 'relative';
        container.style.minHeight = '10px';
        container.innerHTML += '<div style=" font-size:25px; text-align:center; color:black;">Votre sortie</div>';
    } else {
        container = div(elem);
        container.style.position = 'absolute';
        container.style.top = '50%';
        container.style.marginLeft = '0px';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%,-50%)';
        container.innerHTML +=
            '<div style=" font-size:25px; text-align:center; color:black;">Sortie en chargement...</div>';

        const close = div(container);
        close.className = 'divPopUpClose';
        close.onclick = function () {
            closePopUp({target: elem}, elem);
        };
    }

    container.className = 'divTabCahierConfirmationContainer';

    grayBar(container, 5);

    // OWNER & DATES
    let c = 2;
    if (which != 'confirmation') {
        c = 3;
    }
    for (let i = 0; i < c; i++) {
        const d = div(container);
        d.classList.add('divConfirmationTexts');
        div(div(d)).style.backgroundImage = 'url(img/' + images[i] + '.png)';
        div(d).innerHTML = fields[i];
        div(d);
    }

    grayBar(container);

    // EMBARCATIONS
    let d = div(container);
    d.classList.add('divConfirmationTexts');
    d.style.backgroundColor = 'rgb(235,235,235)';
    div(div(d)).style.backgroundImage = 'url(img/' + images[3] + '.png)';
    div(d).innerHTML = fields[3];
    div(d);

    const embContainer = div(container);
    embContainer.classList.add('divTabCahierConfirmationEmbarcationContainer');

    const emb = div(embContainer);
    emb.className = 'divTabCahierConfirmationEmbarcationBox';
    div(div(emb));

    const texts = div(emb);
    texts.className = 'divTabCahierConfirmationContainerTextsContainer';

    div(texts).innerHTML = '...';
    div(texts).innerHTML = '...';

    if (which == 'finish' && options.bookablesComment) {
        // desactivated

        const radioContainer = div(emb);
        radioContainer.className = 'radioContainer';

        const r1 = div(radioContainer);
        r1.classList.add('radioSelected');
        r1.onclick = function () {
            this.classList.add('radioSelected');
            this.nextElementSibling.classList.remove('radioSelected');
            this.parentElement.nextElementSibling.children[0].disabled = true;
            this.parentElement.nextElementSibling.children[0].style.backgroundColor = 'lightgray';
            this.parentElement.nextElementSibling.style.opacity = 0.5;
        }; //this.parentElement.parentElement.getElementsByTagName("textarea")[0].style.opacity = 0;
        div(div(r1));
        div(r1).innerHTML = 'En bon état';
        const r2 = div(radioContainer);
        r2.onclick = function () {
            this.classList.add('radioSelected');
            this.previousElementSibling.classList.remove('radioSelected');
            this.parentElement.nextElementSibling.children[0].disabled = false;
            this.parentElement.nextElementSibling.children[0].style.backgroundColor = 'white';
            this.parentElement.nextElementSibling.style.opacity = 1;
        }; //area.style.opacity = 1;};
        div(div(r2));
        div(r2).innerHTML = 'Endommagé';

        const areaContainer = div(emb);
        areaContainer.style.width = '0px';
        areaContainer.style.height = '0px';
        areaContainer.style.opacity = 0.5;
        const area = document.createElement('textarea');
        area.placeholder = "État de l'embarcation...";
        area.spellcheck = false;
        area.style.left = '350px';
        area.style.top = '30px';
        area.style.height = '95px';
        area.style.width = '290px';
        area.style.backgroundPositionX = '245px';
        area.disabled = 'true';
        area.style.backgroundColor = 'lightgray';
        areaContainer.appendChild(area);
    }

    if (which == 'confirmation') {
        const u = div(container);
        u.classList.add('divTabCahierConfirmationEmbarcationButtonContainer');
        const btn = div(u);
        btn.innerHTML = 'Modifier';
        btn.classList.add('Buttons');
        btn.classList.add('ReturnButtons');
        btn.onclick = function () {
            newTab('divTabCahierEquipmentChoice');
        };
    }

    grayBar(container);

    // END COMMENT
    if (which == 'finish') {
        d = div(container);
        d.classList.add('divConfirmationTexts');
        d.style.backgroundColor = 'rgb(235,235,235)';
        div(div(d)).style.backgroundImage = 'url(img/' + images[7] + '.png)';
        div(d).innerHTML = fields[7];
        const area2 = document.createElement('textarea');
        area2.spellcheck = false;
        area2.placeholder = "Comment ça s'est passé...";
        div(d).appendChild(area2);

        // 1.1
        if (options.modifyBookablesButton) {
            const btnModify = div(container);
            btnModify.style.visibility = 'hidden';
            btnModify.classList.add('Buttons', 'NormalButtons');
            btnModify.id = 'btnModify';
            btnModify.innerHTML = 'Terminer une embarcation';
            btnModify.title = 'Choisir les embarcations à terminer';
        }

        // 1.4
        if (options.editBookingButton) {
            const btnEditBooking = div(container);
            btnEditBooking.style.visibility = 'hidden';
            btnEditBooking.classList.add('Buttons', 'NormalButtons');
            btnEditBooking.id = 'btnEditBooking';
            btnEditBooking.innerHTML = 'Modifier la sortie';
            btnEditBooking.title = 'Modifier la sortie entière';
        }

        const btnFinish = div(container);
        btnFinish.classList.add('Buttons', 'ValidateButtons', 'btnRed');
        btnFinish.innerHTML = 'Terminer';
        // for function see - actualizeBooking...
    }

    // INFOS
    let l = 8;
    if (which == 'confirmation') {
        l = 7;
    } else if (which == 'finish') {
        l = 4; //no infos
    }

    for (let i = 4; i < l; i++) {
        d = div(container);
        d.classList.add('divConfirmationTexts');
        div(div(d)).style.backgroundImage = 'url(img/' + images[i] + '.png)';
        div(d).innerHTML = fields[i];
        div(d);
        if (i / 2 == Math.floor(i / 2)) {
            d.style.backgroundColor = 'rgb(235,235,235)';
        } else {
            d.style.backgroundColor = 'white';
        }
    }

    // EDIT BUTTON
    if (which == 'confirmation') {
        // INFOS
        const bar = div(container);
        bar.classList.add('divConfirmationTexts');
        bar.style.height = '50px';
        bar.style.backgroundColor = 'white';
        div(bar);
        div(bar);
        const u = div(bar);
        u.style.height = '100%';

        const btn2 = div(u);
        btn2.innerHTML = 'Modifier';
        btn2.classList.add('Buttons');
        btn2.classList.add('ReturnButtons');
        btn2.onclick = function () {
            popCahierInfos(0);
        };
    }

    // FILL POP UP BOOKING
    if (which == 'confirmation') {
        actualizePopBooking(Cahier.bookings[0], which, elem);
    }
}

export function actualizePopBooking(booking, which, container = $('divTabCahierConfirmationContainer')) {
    const allDiv = container.getElementsByClassName('divConfirmationTexts');
    const allDivTexts = [];
    for (let i = 0; i < allDiv.length; i++) {
        allDivTexts[i] = allDiv[i].getElementsByTagName('div')[3];
    }

    allDivTexts[0].innerHTML = Cahier.getOwner(booking, true, {length: 1000000, fontSize: 35});

    if (which == 'confirmation') {
        allDivTexts[1].innerHTML = new Date().getNiceTime();
        allDivTexts[3].innerHTML = Cahier.getSingularOrPlural(booking.participantCount, ' Participant');
        allDivTexts[4].innerHTML = booking.destination;
        allDivTexts[5].innerHTML = getStartCommentFromBooking(booking, false);
    } else if (which == 'infos') {
        container
            .getElementsByClassName('divTabCahierConfirmationContainer')[0]
            .getElementsByTagName('div')[0].innerHTML =
            'Sortie du ' + new Date(booking.startDate).getNiceDate(false, true).toLowerCase();
        allDivTexts[1].innerHTML = new Date(booking.startDate).getNiceTime();
        if (booking.endDate == null) {
            if (booking.owner.sex === 'female') {
                allDivTexts[2].innerHTML = 'Pas encore rentrée';
            } else {
                allDivTexts[2].innerHTML = 'Pas encore rentré';
            }
        } else {
            allDivTexts[2].innerHTML = new Date(booking.endDate).getNiceTime();
        }
        allDivTexts[4].innerHTML = Cahier.getSingularOrPlural(booking.participantCount, ' Participant');
        allDivTexts[5].innerHTML = booking.destination;
        allDivTexts[6].innerHTML = getStartCommentFromBooking(booking, false);
        allDivTexts[7].innerHTML = getEndCommentFromBooking(booking, false);
    } else if (which == 'finish') {
        container
            .getElementsByClassName('divTabCahierConfirmationContainer')[0]
            .getElementsByTagName('div')[0].innerHTML =
            'Terminer la sortie du ' + new Date(booking.startDate).getNiceDate(false, true).toLowerCase();
        allDivTexts[1].innerHTML = new Date(booking.startDate).getNiceTime();
        allDivTexts[2].innerHTML = new Date().getNiceTime();

        const btn = container.getElementsByClassName('ValidateButtons')[0];
        btn.addEventListener('click', function () {
            if (options.bookablesComment) {
                const comments = [];

                for (let i = 0; i < booking.ids.length; i++) {
                    const area = container
                        .getElementsByClassName('divTabCahierConfirmationEmbarcationBox')
                        [i].getElementsByTagName('textarea')[0];
                    if (typeof area != 'undefined') {
                        if (area.value != '') {
                            comments[i] =
                                '![' +
                                area.value +
                                ']! ' +
                                container.getElementsByTagName('textarea')[
                                    container.getElementsByTagName('textarea').length - 1
                                ].value;
                        } else {
                            comments[i] =
                                container.getElementsByTagName('textarea')[
                                    container.getElementsByTagName('textarea').length - 1
                                ].value;
                        }
                    } else {
                        comments[i] =
                            container.getElementsByTagName('textarea')[
                                container.getElementsByTagName('textarea').length - 1
                            ].value;
                    }
                }

                Requests.terminateBooking(booking.ids, comments);
            } else {
                const comments = [];
                comments.fillArray(
                    booking.ids.length,
                    container.getElementsByTagName('textarea')[container.getElementsByTagName('textarea').length - 1]
                        .value,
                );
                Requests.terminateBooking(booking.ids, comments);
            }
            closePopUp({target: container}, container);
        });

        // 1.4, 1.5 (Edit Booking)
        $('btnEditBooking').style.visibility = 'visible';
        const minutesAgo = (new Date() - new Date(booking.startDate)) / 1000 / 60;
        // Edit button active
        if (minutesAgo < options.minutesToEditBooking) {
            $('btnEditBooking').onclick = function () {
                closePopUp('last');
                Cahier.bookings[0] = booking.clone();
                Cahier.editedBooking = booking.clone();
                Cahier.bookings[0].currentlyEditing = true;
                Requests.getOwnerLicenses(Cahier.bookings[0].owner); // get licenses back !

                const bookableIds = [];
                for (const bookable of Cahier.bookings[0].bookables) {
                    if (bookable.id != 0) bookableIds.push(bookable.id); // not taking personal equipment
                }
                Requests.getBookablesLicenses(bookableIds);

                $('divTabCahierProgress').classList.add('editing');

                newTab('divTabCahierInfos');
            };
        }
        // Edit button inactive
        else {
            $('btnEditBooking').classList.add('buttonNonActive');
            $('btnEditBooking').title =
                "Il est uniquement possible d'éditer une sortie jusqu'à " +
                options.minutesToEditBooking +
                ' minutes après sa création.';
        }
    }

    const embContainer = container.getElementsByClassName('divTabCahierConfirmationEmbarcationContainer')[0];

    if (booking.bookables.length == 0) {
        // should happen not anymore
        //container.getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[0].innerHTML = "";
        //container.getElementsByClassName('divTabCahierConfirmationContainerTextsContainer')[0].getElementsByTagName('div')[1].innerHTML = "";
        //emb1.getElementsByTagName("div")[0].classList.add("PersonalSail");
    } else {
        embContainer.innerHTML = '';
        let names = [];
        for (let i = 0; i < booking.bookables.length; i++) {
            const emb = div(embContainer);
            emb.className = 'divTabCahierConfirmationEmbarcationBox';
            const img = div(emb);

            img.style.backgroundImage =
                booking.bookables[i].available === false
                    ? 'url(img/icons/info.png), url(img/icons/alert.png),' + Cahier.getImageUrl(booking.bookables[i])
                    : 'url(img/icons/info.png), none,' + Cahier.getImageUrl(booking.bookables[i]);
            div(img);

            if (booking.bookables[i].available === false) {
                img.title = 'Cela va terminer la sortie de ' + booking.bookables[i].lastBooking.owner.name;
                names.push(booking.bookables[i].lastBooking.owner.name);
            }

            const texts = div(emb);
            texts.className = 'divTabCahierConfirmationContainerTextsContainer';

            div(texts).innerHTML = booking.bookables[i].code;
            div(texts).innerHTML = booking.bookables[i].name.shorten(2 * 150, 20);

            // 1.1
            if (which == 'finish' && options.modifyBookablesButton && booking.bookables.length > 1) {
                const t = div(texts);
                t.id = i;
                t.style.visibility = 'hidden';
                t.classList.add('Buttons', 'NormalButtons', 'btnTerminateOneBookable');
                t.innerHTML = 'Terminer';
                t.addEventListener('click', function () {
                    //console.log(booking, this.id, booking.ids[parseInt(this.id)]);
                    Requests.terminateBooking([booking.ids[parseInt(this.id)]], ['']);
                    deleteObjects(this.parentElement.parentElement);
                    if (document.getElementsByClassName('divTabCahierConfirmationEmbarcationBox').length == 0) {
                        closePopUp('last');
                    }
                });

                $('btnModify').style.visibility = 'visible';
                $('btnModify').addEventListener('click', function () {
                    setTimeout(function () {
                        $('btnModify').style.visibility = 'hidden';
                        $('btnModify').nextElementSibling.style.visibility = 'hidden';
                        $('btnModify').nextElementSibling.nextElementSibling.style.visibility = 'hidden';
                    }, 290);
                    this.style.opacity = '0';
                    this.nextElementSibling.style.opacity = '0';
                    this.nextElementSibling.nextElementSibling.style.opacity = '0';
                    this.previousElementSibling.style.opacity = '0.4';
                    this.parentElement.getElementsByTagName('textarea')[0].disabled = 'true';
                    const ts = document.getElementsByClassName('btnTerminateOneBookable');
                    for (let i = 0; i < ts.length; i++) {
                        ts[i].previousElementSibling.innerHTML = ts[i].previousElementSibling.innerHTML.shorten(
                            1 * 150,
                            20,
                        );
                        ts[i].style.visibility = 'visible';
                        ts[i].style.opacity = '1';
                    }
                });
            }

            if (booking.bookables[i].id == 0) {
                // matériel personnel
                img.classList.add('PersonalSail');
                img.innerHTML = '';
            } else {
                img.addEventListener('click', function () {
                    popBookable(booking.bookables[i].id);
                });
            }

            if (which == 'finish' && options.bookablesComment) {
                emb.style.display = 'block';

                if (booking.bookables[i].id != 0) {
                    // matériel personnel

                    const radioContainer = div(emb);
                    radioContainer.className = 'radioContainer';

                    const r1 = div(radioContainer);
                    r1.classList.add('radioSelected');
                    r1.onclick = function () {
                        this.classList.add('radioSelected');
                        this.nextElementSibling.classList.remove('radioSelected');
                        this.parentElement.nextElementSibling.children[0].disabled = true;
                        this.parentElement.nextElementSibling.children[0].style.backgroundColor = 'lightgray';
                        this.parentElement.nextElementSibling.style.opacity = 0.3;
                    }; //this.parentElement.parentElement.getElementsByTagName("textarea")[0].style.opacity = 0;
                    div(div(r1));
                    div(r1).innerHTML = 'En bon état';
                    const r2 = div(radioContainer);
                    r2.onclick = function () {
                        this.classList.add('radioSelected');
                        this.previousElementSibling.classList.remove('radioSelected');
                        this.parentElement.nextElementSibling.children[0].disabled = false;
                        this.parentElement.nextElementSibling.children[0].style.backgroundColor = 'white';
                        this.parentElement.nextElementSibling.style.opacity = 1;
                    }; //area.style.opacity = 1;};
                    div(div(r2));
                    div(r2).innerHTML = 'Endommagé';

                    const areaContainer = div(emb);
                    areaContainer.style.width = '0px';
                    areaContainer.style.height = '0px';
                    areaContainer.style.opacity = 0.5;
                    const area = document.createElement('textarea');
                    area.placeholder = "État de l'embarcation...";
                    area.spellcheck = false;
                    area.style.left = '350px';
                    area.style.top = '30px';
                    area.style.height = '80px';
                    area.style.width = '290px';
                    area.style.backgroundPositionX = '248px';
                    area.style.backgroundPositionY = '35px';
                    area.disabled = 'true';
                    area.style.backgroundColor = 'lightgray';
                    areaContainer.appendChild(area);
                    //area.focus();
                }
            }
        }

        // divWarningText
        if (names.length !== 0) {
            names = names.deleteMultiples();
            $('divTabCahierConfirmation').getElementsByClassName('ValidateButtons')[0].innerHTML =
                'Confirmer votre sortie*';
            if (names.length === 1) {
                $('divWarningText').innerHTML =
                    '* En continuant, la sortie de ' + names[0] + ' va être automatiquement terminée ! <br>';
            } else {
                let txt = names[0];
                for (let i = 1; i < names.length - 1; i++) {
                    txt += ', ' + names[i];
                }
                txt += ' et de ' + names[names.length - 1];
                $('divWarningText').innerHTML =
                    '* En continuant, les sorties de ' + txt + ' vont être automatiquement terminées ! <br><br>';
            }
        } else {
            $('divTabCahierConfirmation').getElementsByClassName('ValidateButtons')[0].innerHTML =
                'Confirmer votre sortie';
            $('divWarningText').innerHTML = '';
        }
    }
}
