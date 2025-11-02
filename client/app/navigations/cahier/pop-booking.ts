import {
    $,
    clone,
    closePopUp,
    deleteElements,
    div,
    fillArray,
    getNiceDate,
    getNiceTime,
    grayBar,
    type MergedBooking,
    openPopUp,
    options,
    shorten,
    unique,
} from '../general/home';
import {type Bookable, type Booking, Requests} from '../general/server-requests';
import {newTab} from '../general/screen';
import {popCahierInfos} from '../infos/pop-infos';
import {Cahier, getEndCommentFromBooking, getStartCommentFromBooking} from './methods';
import {popBookable} from '../equipment/pop-bookable';
import {Sex} from '../../shared/generated-types';

// popBookings
export function loadConfirmation(): void {
    const elem = $('divTabConfirmationOneBookingContainer');
    openBooking('confirmation', elem);
}

export function popBooking(_booking: Booking): void {
    // without all bookables... so if the booking is not complete
    const elem = openPopUp();
    openBooking('infos', elem);
    Requests.getBookingWithBookablesInfos(_booking, 'infos', elem);
}

export function popBookingInfos(_booking: ActualizePopBooking | MergedBooking): void {
    const elem = openPopUp();
    openBooking('infos', elem);
    actualizePopBooking(_booking as ActualizePopBooking, 'infos', elem);
}

export function popBookingFinish(_booking: ActualizePopBooking | MergedBooking): void {
    const elem = openPopUp();
    openBooking('finish', elem);
    actualizePopBooking(_booking as ActualizePopBooking, 'finish', elem);
}

function openBooking(which = 'confirmation', elem = $('divTabConfirmationOneBookingContainer')): void {
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
            closePopUp({target: elem});
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
        div(div(d)).style.backgroundImage = 'url(assets/navigations/' + images[i] + '.png)';
        div(d).innerHTML = fields[i];
        div(d);
    }

    grayBar(container);

    // EMBARCATIONS
    let d = div(container);
    d.classList.add('divConfirmationTexts');
    d.style.backgroundColor = 'rgb(235,235,235)';
    div(div(d)).style.backgroundImage = 'url(assets/navigations/' + images[3] + '.png)';
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
            (this as HTMLElement).classList.add('radioSelected');
            (this as HTMLElement).nextElementSibling!.classList.remove('radioSelected');
            const child = (this as HTMLElement).parentElement!.nextElementSibling!.children[0] as HTMLInputElement;
            child.disabled = true;
            child.style.backgroundColor = 'lightgray';
            ((this as HTMLElement).parentElement!.nextElementSibling as HTMLElement).style.opacity = '0.5';
        }; //this.parentElement.parentElement.getElementsByTagName("textarea")[0].style.opacity = 0;
        div(div(r1));
        div(r1).innerHTML = 'En bon état';
        const r2 = div(radioContainer);
        r2.onclick = function () {
            (this as HTMLElement).classList.add('radioSelected');
            (this as HTMLElement).previousElementSibling!.classList.remove('radioSelected');
            const nextElementSibling = (this as HTMLElement).parentElement!.nextElementSibling as HTMLElement;
            const child = nextElementSibling.children[0] as HTMLInputElement;
            child.disabled = false;
            child.style.backgroundColor = 'white';
            nextElementSibling.style.opacity = '1';
        }; //area.style.opacity = '1';};
        div(div(r2));
        div(r2).innerHTML = 'Endommagé';

        const areaContainer = div(emb);
        areaContainer.style.width = '0px';
        areaContainer.style.height = '0px';
        areaContainer.style.opacity = '0.5';
        const area = document.createElement('textarea');
        area.placeholder = "État de l'embarcation...";
        area.spellcheck = false;
        area.style.left = '350px';
        area.style.top = '30px';
        area.style.height = '95px';
        area.style.width = '290px';
        area.style.backgroundPositionX = '245px';
        area.disabled = true;
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
        div(div(d)).style.backgroundImage = 'url(assets/navigations/' + images[7] + '.png)';
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
        div(div(d)).style.backgroundImage = 'url(assets/navigations/' + images[i] + '.png)';
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

export type PopBookingWhich = 'confirmation' | 'infos' | 'finish';

export type ActualizePopBooking = Booking & {
    ids: string[];
    bookables: (Bookable & {available?: boolean | undefined; lastBooking: Booking})[];
};

export function actualizePopBooking(
    booking: ActualizePopBooking,
    which: PopBookingWhich,
    container: Element = $('divTabCahierConfirmationContainer'),
): void {
    const allDiv = container.getElementsByClassName('divConfirmationTexts');
    const allDivTexts = [];
    for (let i = 0; i < allDiv.length; i++) {
        allDivTexts[i] = allDiv[i].getElementsByTagName('div')[3];
    }

    allDivTexts[0].innerHTML = Cahier.getOwner(booking, true, {length: 1000000, fontSize: 35});

    if (which == 'confirmation') {
        allDivTexts[1].innerHTML = getNiceTime(new Date());
        allDivTexts[3].innerHTML = Cahier.getSingularOrPlural(booking.participantCount, ' Participant');
        allDivTexts[4].innerHTML = booking.destination;
        allDivTexts[5].innerHTML = getStartCommentFromBooking(booking, false);
    } else if (which == 'infos') {
        container
            .getElementsByClassName('divTabCahierConfirmationContainer')[0]
            .getElementsByTagName('div')[0].innerHTML =
            'Sortie du ' + getNiceDate(new Date(booking.startDate), false, true).toLowerCase();
        allDivTexts[1].innerHTML = getNiceTime(new Date(booking.startDate));
        if (booking.endDate == null) {
            if (booking.owner?.sex === Sex.female) {
                allDivTexts[2].innerHTML = 'Pas encore rentrée';
            } else {
                allDivTexts[2].innerHTML = 'Pas encore rentré';
            }
        } else {
            allDivTexts[2].innerHTML = getNiceTime(new Date(booking.endDate));
        }
        allDivTexts[4].innerHTML = Cahier.getSingularOrPlural(booking.participantCount, ' Participant');
        allDivTexts[5].innerHTML = booking.destination;
        allDivTexts[6].innerHTML = getStartCommentFromBooking(booking, false);
        allDivTexts[7].innerHTML = getEndCommentFromBooking(booking, false);
    } else if (which == 'finish') {
        container
            .getElementsByClassName('divTabCahierConfirmationContainer')[0]
            .getElementsByTagName('div')[0].innerHTML =
            'Terminer la sortie du ' + getNiceDate(new Date(booking.startDate), false, true).toLowerCase();
        allDivTexts[1].innerHTML = getNiceTime(new Date(booking.startDate));
        allDivTexts[2].innerHTML = getNiceTime(new Date());

        const btn = container.getElementsByClassName('ValidateButtons')[0];
        btn.addEventListener('click', function () {
            if (options.bookablesComment) {
                const comments = [];

                for (let i = 0; i < booking.ids.length; i++) {
                    const box = container.getElementsByClassName('divTabCahierConfirmationEmbarcationBox');
                    const area = box[i].getElementsByTagName('textarea')[0];
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
                const comments = fillArray(
                    booking.ids.length,
                    container.getElementsByTagName('textarea')[container.getElementsByTagName('textarea').length - 1]
                        .value,
                );
                Requests.terminateBooking(booking.ids, comments);
            }
            closePopUp({target: container});
        });

        // 1.4, 1.5 (Edit Booking)
        $('btnEditBooking').style.visibility = 'visible';
        const minutesAgo = (new Date().getMilliseconds() - new Date(booking.startDate).getMilliseconds()) / 1000 / 60;
        // Edit button active
        if (minutesAgo < options.minutesToEditBooking) {
            $('btnEditBooking').onclick = function () {
                closePopUp('last');
                Cahier.bookings[0] = {...clone(booking), currentlyEditing: true};
                Cahier.editedBooking = {ids: [booking.id]};
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
        let names: string[] = [];
        for (let i = 0; i < booking.bookables.length; i++) {
            const emb = div(embContainer);
            emb.className = 'divTabCahierConfirmationEmbarcationBox';
            const img = div(emb);

            img.style.backgroundImage =
                booking.bookables[i].available === false
                    ? 'url(assets/navigations/icons/info.png), url(assets/navigations/icons/alert.png),' +
                      Cahier.getImageUrl(booking.bookables[i])
                    : 'url(assets/navigations/icons/info.png), none,' + Cahier.getImageUrl(booking.bookables[i]);
            div(img);

            if (booking.bookables[i].available === false) {
                const name = booking.bookables[i].lastBooking.owner?.name ?? '';
                img.title = 'Cela va terminer la sortie de ' + name;
                names.push(name);
            }

            const texts = div(emb);
            texts.className = 'divTabCahierConfirmationContainerTextsContainer';

            div(texts).innerHTML = booking.bookables[i].code ?? '';
            div(texts).innerHTML = shorten(booking.bookables[i].name, 2 * 150, 20);

            // 1.1
            if (which == 'finish' && options.modifyBookablesButton && booking.bookables.length > 1) {
                const t = div(texts);
                t.id = '' + i;
                t.style.visibility = 'hidden';
                t.classList.add('Buttons', 'NormalButtons', 'btnTerminateOneBookable');
                t.innerHTML = 'Terminer';
                t.addEventListener('click', function () {
                    //console.log(booking, this.id, booking.ids[parseInt(this.id)]);
                    Requests.terminateBooking([booking.ids[parseInt(this.id)]], ['']);
                    deleteElements(this.parentElement!.parentElement!);
                    if (document.getElementsByClassName('divTabCahierConfirmationEmbarcationBox').length == 0) {
                        closePopUp('last');
                    }
                });

                $('btnModify').style.visibility = 'visible';
                $('btnModify').addEventListener('click', function () {
                    setTimeout(function () {
                        $('btnModify').style.visibility = 'hidden';
                        const nextElementSibling1 = $('btnModify').nextElementSibling as HTMLElement;
                        nextElementSibling1.style.visibility = 'hidden';
                        (nextElementSibling1.nextElementSibling as HTMLElement).style.visibility = 'hidden';
                    }, 290);
                    this.style.opacity = '0';
                    const nextElementSibling = this.nextElementSibling as HTMLElement;
                    nextElementSibling.style.opacity = '0';
                    (nextElementSibling.nextElementSibling as HTMLElement).style.opacity = '0';
                    (this.previousElementSibling as HTMLElement).style.opacity = '0.4';
                    this.parentElement!.getElementsByTagName('textarea')[0].disabled = true;
                    const ts = document.getElementsByClassName(
                        'btnTerminateOneBookable',
                    ) as HTMLCollectionOf<HTMLElement>;
                    for (const t1 of ts) {
                        t1.previousElementSibling!.innerHTML = shorten(
                            t1.previousElementSibling!.innerHTML,
                            1 * 150,
                            20,
                        );
                        t1.style.visibility = 'visible';
                        t1.style.opacity = '1';
                    }
                });
            }

            if (booking.bookables[i].id == '0') {
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

                if (booking.bookables[i].id != '0') {
                    // matériel personnel

                    const radioContainer = div(emb);
                    radioContainer.className = 'radioContainer';

                    const r1 = div(radioContainer);
                    r1.classList.add('radioSelected');
                    r1.onclick = function () {
                        (this as HTMLDivElement).classList.add('radioSelected');
                        (this as HTMLDivElement).nextElementSibling!.classList.remove('radioSelected');
                        const element = (this as HTMLDivElement).parentElement!.nextElementSibling!
                            .children[0] as HTMLInputElement;
                        element.disabled = true;
                        element.style.backgroundColor = 'lightgray';
                        ((this as HTMLDivElement).parentElement!.nextElementSibling as HTMLElement).style.opacity =
                            '0.3';
                    }; //this.parentElement.parentElement.getElementsByTagName("textarea")[0].style.opacity = 0;
                    div(div(r1));
                    div(r1).innerHTML = 'En bon état';
                    const r2 = div(radioContainer);
                    r2.onclick = function () {
                        (this as HTMLDivElement).classList.add('radioSelected');
                        (this as HTMLDivElement).previousElementSibling!.classList.remove('radioSelected');
                        const element = (this as HTMLDivElement).parentElement!.nextElementSibling!
                            .children[0] as HTMLInputElement;
                        element.disabled = false;
                        element.style.backgroundColor = 'white';
                        ((this as HTMLDivElement).parentElement!.nextElementSibling as HTMLElement).style.opacity = '1';
                    }; //area.style.opacity = '1';};
                    div(div(r2));
                    div(r2).innerHTML = 'Endommagé';

                    const areaContainer = div(emb);
                    areaContainer.style.width = '0px';
                    areaContainer.style.height = '0px';
                    areaContainer.style.opacity = '0.5';
                    const area = document.createElement('textarea');
                    area.placeholder = "État de l'embarcation...";
                    area.spellcheck = false;
                    area.style.left = '350px';
                    area.style.top = '30px';
                    area.style.height = '80px';
                    area.style.width = '290px';
                    area.style.backgroundPositionX = '248px';
                    area.style.backgroundPositionY = '35px';
                    area.disabled = true;
                    area.style.backgroundColor = 'lightgray';
                    areaContainer.appendChild(area);
                    //area.focus();
                }
            }
        }

        // divWarningText
        if (names.length !== 0) {
            names = unique(names);
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
