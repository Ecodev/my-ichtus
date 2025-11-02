import {$, clone, fillArray, options, replaceTxtByTxt, shorten, stopWaiting, waiting} from '../general/home';
import {
    popAlertAlreadyHavingABooking,
    popAlertBookablesHaveJustBeenBooked,
    popAlertLate,
    popAlertMissingLicense,
    popAlertMoreBookablesThanParticipants,
    popAlertNoWelcomeSession,
    popAlertTooManyBookables,
    popAlertTooManyParticipants,
} from '../general/pop-alert';
import {loadConfirmation} from './pop-booking';
import {changeProgress, currentProgress, progessionTabNames} from './top';
import {currentTabElement, newTab} from '../general/screen';
import {actualizeBookableList} from './top-list';
import {actualizeElements} from '../equipment/elements';
import {Requests} from '../general/server-requests';
import {animate} from '../page/top';
import {type BookingInput, type BookingPartialInput, Sex} from '../../shared/generated-types';
import type {Bookable, BookableWithLastBooking, Booking, MergedBooking, User} from '../types';

export const Cahier = {
    actualBookings: [] as MergedBooking[],

    finishedBookings: [] as MergedBooking[][],

    // 1.4
    editedBooking: {ids: [] as string[]},

    bookings: [
        {
            owner: {id: '0', name: 'Michel pas défini', sex: Sex.male, licenses: []},
            bookables: [],
            participantCount: 1,
            destination: 'Non défini',
            startComment: '',
            currentlyEditing: undefined,
        } as any,
    ],

    personalBookable: {
        id: '0',
        code: 'Perso',
        name: 'Matériel personnel',
        licenses: [],
    } as unknown as Bookable,

    bookingStartDate: new Date(),

    ProgressBarTexts: ['Nom', 'Informations', 'Embarcations', 'Confirmation'],

    getImageUrl: function (_bookable: Bookable, size = 220): string {
        if (_bookable.id == '0') {
            // matériel personnel
            return 'url(assets/navigations/icons/own-sail.png)';
        } else if (_bookable.image != null) {
            return 'url(https://ichtus.club/api/image/' + _bookable.image.id + '/' + size + ')';
        } else {
            return 'url(assets/navigations/icons/no-picture.png)';
        }
    },

    getSingularOrPlural: function (nbr: number, txt: string): string {
        if (nbr == 0) {
            return 'Aucun';
        } else if (nbr == 1) {
            return '1' + txt;
        } else {
            return nbr + txt + 's';
        }
    },

    // get Owner
    getOwner: function (booking: Booking, wantImg = false, shortenOptions = {length: 10000, fontSize: 20}): string {
        if (!booking.owner) {
            return '';
        } else if (wantImg) {
            let img = 'assets/navigations/icons/man.png';
            if (booking.owner.sex == Sex.female) {
                img = 'assets/navigations/icons/woman.png';
            }
            return (
                "<div id='" +
                booking.owner.name +
                "' class='TableEntriesImg' style='background-image:url(" +
                img +
                ");  display: inline-block;vertical-align: middle;'>" +
                '</div>' +
                "<div style=' display: inline-block;vertical-align: middle;'>" +
                shorten(booking.owner.name, shortenOptions.length - 40, shortenOptions.fontSize) +
                '</div>'
            );
        } else {
            return booking.owner.name;
        }
    },

    // when clicking on "Annoncer une sortie"
    btnNewBookingClick: function (): void {
        if (new Date().getHours() >= options.lateHourWarning) popAlertLate(); // 1.5
        newTab('divTabCahierMember');
    },

    // cancel - clearData
    cancel: function (): void {
        // #divCahierInfos
        const allTabCahierFields = document.getElementsByClassName('TabCahierFields');

        for (let i = 0; i < allTabCahierFields.length - 1; i++) {
            // -1 POUR EVITER LA TEXTAREA
            allTabCahierFields[i].getElementsByTagName('input')[0].value = '';
            allTabCahierFields[i].getElementsByTagName('input')[0].style.backgroundImage = 'none';
            allTabCahierFields[i].getElementsByTagName('input')[0].style.borderColor = 'black';
            allTabCahierFields[i].getElementsByTagName('div')[0].style.backgroundColor = 'black';
        }

        document.getElementsByClassName('divTabCahierInfosStartComment')[0].getElementsByTagName('textarea')[0].value =
            '';
        document.getElementsByClassName('divTabCahierInfosNbrInvites')[0].getElementsByTagName('input')[0].value = '1';
        document.getElementsByClassName('divTabCahierInfosDestination')[0].getElementsByTagName('input')[0].value =
            'Baie';

        $('inputTabCahierEquipmentElementsInputSearch').value = '';

        $('divTabCahierEquipmentElementsSelectSort')
            .getElementsByTagName('select')[0]
            .getElementsByTagName('option')[0].selected = true;
        $('divTabCahierEquipmentElementsSelectSort').getElementsByTagName('div')[0].style.backgroundImage =
            'url("assets/navigations/icons/sort-asc.png")';

        document
            .getElementsByClassName('divTabCahierEquipmentChoiceInputCodeContainer')[0]
            .getElementsByTagName('input')[0].value = '';

        $('divTabCahierMember').getElementsByTagName('input')[0].value = '';
        $('divTabCahierSearchResult').innerHTML = '';

        changeProgress(1);

        document
            .getElementsByClassName('divTabCahierEquipmentChoiceContainer')[0]
            .children[3].children[0].classList.remove('buttonNonActive');

        Requests.getActualBookingList();

        Cahier.bookings = [
            {
                owner: {},
                bookables: [],
                participantCount: 1,
                destination: 'Non défini',
                startComment: '',
            },
        ];

        Cahier.editedBooking = {ids: []};

        Cahier.bookingStartDate = new Date();

        $('divTabCahierProgress').classList.remove('editing');

        //console.log("--> Cahier.cancel()");
    },

    confirm: function (): void {
        if (Cahier.bookings[0].participantCount > 15) {
            popAlertTooManyParticipants();
        } else if (Cahier.bookings[0].bookables.length > 10) {
            popAlertTooManyBookables();
        } else if (Cahier.bookings[0].participantCount < Cahier.bookings[0].bookables.length) {
            // if more bookables than participants
            popAlertMoreBookablesThanParticipants(
                Cahier.bookings[0].bookables.length,
                Cahier.bookings[0].participantCount,
            );
        } else {
            // licences check
            for (const bookable of Cahier.bookings[0].bookables) {
                if (bookable.licenses != undefined) {
                    for (const license of bookable.licenses) {
                        let foundLicense = false;
                        for (const ownerLicense of Cahier.bookings[0].owner.licenses) {
                            if (ownerLicense.id == license.id) {
                                foundLicense = true;
                            }
                        }
                        if (!foundLicense) {
                            popAlertMissingLicense(license, bookable);
                            return;
                        }
                    }
                }
            }

            // rechecking if bookings still available
            waiting();
            Requests.checksBookablesAvailabilityBeforeConfirming(Cahier.bookings[0].bookables);
        }
    },

    // 1.3
    actualizeConfirmKnowingBookablesAvailability: function (_bookings: Booking[]): void {
        // receive bookings that are still using the bookables and those who have been terminated in the last minutes

        // the bookings that will have to be terminated before creating the actual booking
        const bookingsIdToFinish: string[] = [];

        // find all the bookables that are now unavailable
        const bAreNotAvailable: (Booking['bookable'] & {lastBooking: Booking})[] = [];
        for (const booking of _bookings) {
            if (booking.endDate == null) {
                // check which bookables are being used
                bAreNotAvailable.push({
                    ...clone(booking.bookable!),
                    lastBooking: clone(booking),
                });
                //                bookingsIdToFinish.push(_bookings[i].id);
            }
        }
        const isNowAvailable = function (_bookable: Bookable): boolean {
            if (_bookable.id == '0') return true; // matériel personnel
            for (const bNotAvailable of bAreNotAvailable) {
                if (bNotAvailable.id == _bookable.id) {
                    return false;
                }
            }
            return true;
        };
        // get the owner of the last booking that isn't finished yet
        const getLastBooking = function (_bookable: Bookable): Booking | false {
            for (const bNotAvailable of bAreNotAvailable) {
                if (bNotAvailable.id == _bookable.id) {
                    return bNotAvailable.lastBooking;
                }
            }
            return false;
        };

        const bookablesHaveJustBeenBooked: BookableWithLastBooking[] = []; // or have changed owner !

        // loop through all the chosen bookables
        for (const bookable of Cahier.bookings[0].bookables) {
            // the bookable is supposed to be unavailable
            if (bookable.available == false) {
                // but is now available !
                if (isNowAvailable(bookable)) {
                    console.warn(
                        'The ' + bookable.code + ' has just become available, no need to terminate the booking.',
                    );
                    Cahier.actualizeAvailability(bookable.id, []); // has become available
                }
                // and is still unavailable
                else {
                    const itsLastBooking = getLastBooking(bookable);
                    if (itsLastBooking && itsLastBooking.owner?.id == bookable.lastBooking.owner.id) {
                        //                   console.log("owner hasn't changed");
                        bookingsIdToFinish.push(bookable.lastBooking.id);
                    } else {
                        //                    console.log("owner has changed !");
                        Cahier.actualizeAvailability(bookable.id, [itsLastBooking]); // has changed owner
                        bookablesHaveJustBeenBooked.push({
                            ...clone(bookable),
                            lastBooking: clone(itsLastBooking),
                        });
                    }
                }
            }
            // the bookable is supposed to be available
            else {
                // and is still available
                if (isNowAvailable(bookable)) {
                    // nothing to do
                }
                // but isn't available anymore, so has just been booked (or is in edit mode) !
                else {
                    //                 console.log("has just been booked !");
                    const itsLastBooking = getLastBooking(bookable);

                    // 1.4
                    // not in edit mode, so someone has just booked the bookable, will make an alert
                    if (Cahier.bookings[0].currentlyEditing == undefined) {
                        Cahier.actualizeAvailability(bookable.id, [itsLastBooking]); // has changed owner
                        const bookableElement = clone(bookable);
                        bookableElement.lastBooking = clone(itsLastBooking);
                        bookablesHaveJustBeenBooked.push(bookableElement);
                    }
                    // was in edit mode
                    else {
                        let bookableWasInTheEditedBooking = false;
                        for (const id of Cahier.editedBooking.ids) {
                            if (itsLastBooking && itsLastBooking.id == id) {
                                bookableWasInTheEditedBooking = true;
                                break;
                            }
                        }

                        // bookable was already in the edited booking and is still there
                        if (bookableWasInTheEditedBooking) {
                            // nothing to do, the edited bookings will terminate by themselves after anyways
                            //                          console.log("because it was edited, so fine :)");
                        }
                        // someone has indeed just booked the bookable, will make an alert
                        else {
                            Cahier.actualizeAvailability(bookable.id, [itsLastBooking]); // has changed owner
                            const bookableElement = clone(bookable);
                            bookableElement.lastBooking = clone(itsLastBooking);
                            bookablesHaveJustBeenBooked.push(bookableElement);
                            //                            console.log("indeed someone has booked it!");
                        }
                    }
                }
            }
        }

        // make alert as some bookables have just been booked
        if (bookablesHaveJustBeenBooked.length != 0) {
            popAlertBookablesHaveJustBeenBooked(bookablesHaveJustBeenBooked);
            loadConfirmation();
            stopWaiting();
        }
        // no alert needed
        else {
            // 1.4 bookings to terminate because they have been edited

            // In edit mode
            if (Cahier.bookings[0].currentlyEditing != undefined) {
                if (Cahier.editedBooking.ids.length == 0) {
                    console.error("Can't edit a booking that has no bookables -> Impossible case.");
                }

                // 1.5
                // The (new) updated booking is given by Cahier.bookings[0]
                // The (old) original booking is saved under Cahier.editedBooking

                // At least as many bookables as the (old) original booking

                // variables
                let idsToFinish: string[] = [];
                let commentsToFinish: string[] = [];
                let inputsToCreate: BookingInput[] = [];
                let idsToUpdate: string[] = [];
                let inputsToUpdate: BookingPartialInput[] = [];

                const currentDate = new Date().toISOString();
                const bookingsInputs = Requests.getServerInputsForBookingCreating(Cahier.bookings[0], currentDate);

                // If >0: more bookables than before --> need to create some new
                // If <0: less bookable than before -->, need to delete some
                const nBookablesDifference = Cahier.bookings[0].bookables.length - Cahier.editedBooking.ids.length;

                // Strictly fewer bookables as the (old) original booking --> Need to finish/delete a few bookings
                if (nBookablesDifference < 0) {
                    const nBookingsToFinish = -nBookablesDifference;

                    // ToUpdate
                    idsToUpdate = Cahier.editedBooking.ids.slice(0, -nBookingsToFinish);
                    inputsToUpdate = bookingsInputs;

                    // ToUpdate (set end date to start date)
                    const extraIdsToUpdate = Cahier.editedBooking.ids.slice(-nBookingsToFinish);
                    // Note: need to update startDate again since otherwise it gets automatically set to the current time
                    const input = {
                        startDate: currentDate,
                        endDate: currentDate,
                        bookable: null,
                        endComment: '(Editée)',
                    };
                    const extraInputsToUpdate = fillArray(extraIdsToUpdate.length, input);

                    // append
                    idsToUpdate = idsToUpdate.concat(extraIdsToUpdate);
                    inputsToUpdate = inputsToUpdate.concat(extraInputsToUpdate);

                    console.log(
                        'Editing: need to update (i.e. terminating)',
                        -nBookablesDifference,
                        'old booking(s) (set startDate=endDate).',
                    );
                }
                // Strictly more bookables as the (old) original booking --> Need to create additional bookings
                else if (nBookablesDifference > 0) {
                    // ToCreate
                    inputsToCreate = bookingsInputs.slice(-nBookablesDifference);

                    // ToUpdate
                    idsToUpdate = Cahier.editedBooking.ids;
                    inputsToUpdate = bookingsInputs.slice(0, -nBookablesDifference);

                    console.log('Editing: need to create', nBookablesDifference, 'additional booking(s).');
                }
                // Same number of bookables
                else {
                    // ToUpdate
                    idsToUpdate = Cahier.editedBooking.ids;
                    inputsToUpdate = bookingsInputs;

                    console.log('Editing: no need to create nor delete any bookings.');
                }

                // Steps:
                // - Terminate the bookings due to unavailable bookables
                // - Create new bookings if needed
                // - Update the remaining ones
                // - Set end date to start date if terminated old bookings

                // First add the bookings to finish because used by someone else
                idsToFinish = idsToFinish.concat(bookingsIdToFinish);
                const comments = fillArray(bookingsIdToFinish.length, 'Terminée automatiquement');
                commentsToFinish = commentsToFinish.concat(comments);
                console.log('Need to terminate', bookingsIdToFinish.length, 'booking(s) due to unavailable bookables.');
                Requests.terminateCreateAndUpdateBookings(
                    idsToFinish,
                    commentsToFinish,
                    inputsToCreate,
                    idsToUpdate,
                    inputsToUpdate,
                );
                animate();
            }

            // Not in edit mode
            else {
                // bookings to terminate to free the bookables
                const commentsToFinish = fillArray(bookingsIdToFinish.length, 'Terminée automatiquement');

                // there are no bookings to termiante
                if (bookingsIdToFinish.length == 0) {
                    Requests.createBooking();
                    animate();
                }
                // there are some bookings to terminate first
                else {
                    Requests.terminateBooking(bookingsIdToFinish, commentsToFinish, false);
                    animate();
                }
            }
        }
    },

    // 1.4
    updateBookablesLicenses: function (_bookables: Bookable[]): void {
        for (const _bookable of _bookables) {
            for (const bookable of Cahier.bookings[0].bookables) {
                if (bookable.id == _bookable.id) {
                    bookable.licenses = clone(_bookable.licenses); // bookable <-> Cahier.bookings[0].bookables[x] by reference
                    break; // one loop
                }
            }
        }
    },

    actualizeProgressBar: function (): void {
        const allDivTabCahierProgressTexts = document.getElementsByClassName('divTabCahierProgressText');
        for (let i = 0; i < allDivTabCahierProgressTexts.length; i++) {
            if (i < currentProgress - 1) {
                switch (i) {
                    case 0:
                        allDivTabCahierProgressTexts[i].innerHTML = Cahier.bookings[0].owner.name;
                        break;
                    case 1:
                        allDivTabCahierProgressTexts[i].innerHTML =
                            Cahier.bookings[0].destination + ' & ' + Cahier.bookings[0].participantCount + ' P.';
                        break;
                    case 2: {
                        let txt = '';
                        for (const bookable of Cahier.bookings[0].bookables) {
                            if (bookable.code != null) {
                                txt += bookable.code + ', ';
                            } else {
                                txt += bookable.name + ', ';
                            }
                        }
                        txt = txt.substring(0, txt.length - 2);
                        allDivTabCahierProgressTexts[i].innerHTML = txt;
                        break;
                    }
                    default:
                        break;
                }
            } else {
                allDivTabCahierProgressTexts[i].innerHTML = Cahier.ProgressBarTexts[i];
            }
        }

        if (currentProgress == 1 || (currentProgress == 2 && $('divTabCahierProgress').classList.contains('editing'))) {
            $('divTabCahierProgressReturn').style.visibility = 'hidden';
        } else {
            $('divTabCahierProgressReturn').style.visibility = 'visible';
            $('divTabCahierProgressReturn').onclick = function () {
                const newTabName = progessionTabNames[currentProgress - 1];
                if (newTabName != 'divTabCahierMember' || !$('divTabCahierProgress').classList.contains('editing')) {
                    newTab(newTabName);
                }
            };
        }
    },

    actualizeConfirmation: function (): void {
        if (currentTabElement.id == 'divTabCahierConfirmation') {
            loadConfirmation();
        }
    },

    setOwner: function (nbr: number, _owner: User, force = false): void {
        _owner = clone(_owner);
        let t = true;
        if (!force) {
            for (const item of Cahier.actualBookings) {
                if (item.owner?.id == _owner.id) {
                    t = false;
                    break;
                }
            }
        }

        //if (_owner.id == "2085") alert("Bonjour maître");

        if (options.showAlertNoWelcomeSession && _owner.welcomeSessionDate == null) {
            popAlertNoWelcomeSession(_owner);
        } else if (!t) {
            popAlertAlreadyHavingABooking(_owner);
        } else {
            Cahier.bookingStartDate = new Date();
            Cahier.bookings[nbr].owner.id = _owner.id;
            Cahier.bookings[nbr].owner.name = _owner.name;
            Cahier.bookings[nbr].owner.sex = _owner.sex;
            // Empty licenses until the real licenses come from the request
            Cahier.bookings[nbr].licenses = [];
            Cahier.actualizeConfirmation();
            // Update owner with full information
            Requests.getOwnerLicenses(_owner);

            newTab('divTabCahierInfos');
        }
    },

    setOwnerLicenses: function (_owner: User): void {
        if (Cahier.bookings[0].owner.id === _owner.id) {
            Cahier.bookings[0].owner = _owner;
        } else {
            console.warn(
                'getOwnerLicenses(): request too late or not corresponding to the actual owner ' +
                    Cahier.bookings[0].owner.name +
                    '(vs. ' +
                    _owner.name +
                    ')',
            );
        }
    },

    addBookable: function (nbr: number, _bookable: Bookable, _lastBooking: Booking | undefined = undefined): void {
        Cahier.bookings[nbr].bookables.push(_bookable);

        if (_bookable.id == '0') {
            // matériel personnel
            document
                .getElementsByClassName('divTabCahierEquipmentChoiceContainer')[0]
                .children[3].children[0].classList.add('buttonNonActive');
        } else if (_lastBooking != undefined) {
            // used when selecting a bookable by code

            Cahier.bookings[nbr].bookables[Cahier.bookings[nbr].bookables.length - 1].available =
                _lastBooking.endDate != null;
            Cahier.bookings[nbr].bookables[Cahier.bookings[nbr].bookables.length - 1].lastBooking = _lastBooking;

            // 1.4 : make fake availability if the actual bookable was in the edited booking
            if (Cahier.bookings[0].currentlyEditing != undefined) {
                for (const bookingId of Cahier.editedBooking.ids) {
                    if (_lastBooking.id == bookingId) {
                        Cahier.bookings[nbr].bookables[Cahier.bookings[nbr].bookables.length - 1].available = true;
                        break;
                    }
                }
            }
        } else Requests.getBookableLastBooking(_bookable.id);

        actualizeBookableList();
        Cahier.actualizeConfirmation();
    },

    actualizeAvailability: function (bookableId: string, bookings: (false | Booking)[]): void {
        let u;
        for (u = 0; u < Cahier.bookings[0].bookables.length; u++) {
            if (Cahier.bookings[0].bookables[u].id === bookableId) {
                break;
            }
        }

        if (bookings.length !== 0) {
            const lastBooking = clone(bookings[0]);

            Cahier.bookings[0].bookables[u].available = lastBooking && lastBooking.endDate != null;
            Cahier.bookings[0].bookables[u].lastBooking = lastBooking;

            // 1.4 : make fake availability (actually already used in the current booking that is being edited...)
            if (Cahier.bookings[0].currentlyEditing != undefined) {
                for (const bookingId of Cahier.editedBooking.ids) {
                    if (lastBooking && lastBooking.id == bookingId) {
                        Cahier.bookings[0].bookables[u].available = true;
                        break;
                    }
                }
            }
        } else {
            Cahier.bookings[0].bookables[u].available = true;
        }
        actualizeBookableList();
        Cahier.actualizeConfirmation();
    },

    removeBookable: function (nbr = 0, _bookable: Bookable): void {
        let i;
        for (i = 0; i < Cahier.bookings[nbr].bookables.length; i++) {
            if (Cahier.bookings[nbr].bookables[i].id == _bookable.id) {
                break;
            }
        }

        if (_bookable.id == '0') {
            document
                .getElementsByClassName('divTabCahierEquipmentChoiceContainer')[0]
                .children[3].children[0].classList.remove('buttonNonActive');
        }

        Cahier.bookings[nbr].bookables.splice(i, 1);

        //console.log("removeBookable(): ", nbr, Cahier.bookings[nbr].bookables);
        Cahier.actualizeConfirmation();
        actualizeBookableList();
        if (currentTabElement.id == 'divTabCahierEquipmentElements') {
            actualizeElements();
        }
    },

    setInfos: function (nbr: number, _participantCount: number, _destination: string, _startComment: string): void {
        Cahier.bookings[nbr].participantCount = _participantCount;
        Cahier.bookings[nbr].destination = _destination;
        Cahier.bookings[nbr].startComment = _startComment;

        //console.log("setInfos(): ", nbr, Cahier.bookings[nbr].participantCount, Cahier.bookings[nbr].destination, Cahier.bookings[nbr].startComment);
        Cahier.actualizeConfirmation();
    },
};

function transformComment(txt: string, fill: boolean): string {
    txt = replaceTxtByTxt(
        txt,
        'nft',
        " <img style='display:inline-block; vertical-align:middle;' src='assets/navigations/comments/nft.png'/> ",
    );
    txt = replaceTxtByTxt(
        txt,
        'joran',
        " joran<img style='display:inline-block; vertical-align:middle;' src='assets/navigations/comments/joran.png'/> ",
        true,
    );
    txt = replaceTxtByTxt(
        txt,
        'Joran',
        " Joran<img style='display:inline-block; vertical-align:middle;' src='assets/navigations/comments/joran.png'/> ",
        true,
    );
    txt = replaceTxtByTxt(
        txt,
        'soleil',
        "soleil<img style='display:inline-block; vertical-align:middle;' src='assets/navigations/comments/soleil.png'/> ",
        true,
    );
    txt = replaceTxtByTxt(
        txt,
        'Soleil',
        "Soleil<img style='display:inline-block; vertical-align:middle;' src='assets/navigations/comments/soleil.png'/> ",
        true,
    );
    txt = replaceTxtByTxt(
        txt,
        'Corto',
        "<img style='display:inline-block; vertical-align:middle;' src='assets/navigations/comments/corto.png'/> ",
        true,
    );
    txt = replaceTxtByTxt(
        txt,
        'Dimitri',
        "<img style='display:inline-block; vertical-align:middle;' src='assets/navigations/comments/dimitri.png'/> ",
        true,
    );

    if (txt.length == 0 && fill) {
        txt = 'Pas de commentaire';
    }
    return txt;
}

export function getStartCommentFromBooking(booking: Booking, fill = false): string {
    const txt = booking.startComment;
    return transformComment(txt, fill);
}

export function getEndCommentFromBooking(booking: Booking, fill = false): string {
    const txt = booking.endComment;
    return transformComment(txt, fill);
}
