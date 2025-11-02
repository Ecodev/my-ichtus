import {$, closePopUp} from '../general/home';
import {Cahier} from '../cahier/methods';
import {newTab} from '../general/screen';

export function writeDestination(elem: HTMLInputElement): void {
    if (elem.value.length > 2) {
        AcceptInfos(elem);
    } else {
        DenyInfos(elem);
    }
}
export function writeNbrInvites(elem: HTMLInputElement): void {
    if (elem.value != '' && parseInt(elem.value) != 0 && parseInt(elem.value) > 0) {
        AcceptInfos(elem);
    } else {
        DenyInfos(elem);
    }
}

export function createAllPropositions(location: HTMLElement = $('divTabCahierInfos')): void {
    const allDestinationPropositions = location
        .getElementsByClassName('divTabCahierInfosDestinationPropositions')[0]
        .getElementsByTagName('div');
    for (const elem of allDestinationPropositions) {
        elem.addEventListener('mousedown', function () {
            location.getElementsByClassName('divTabCahierInfosDestination')[0].getElementsByTagName('input')[0].value =
                this.innerHTML;
            writeDestination(
                location.getElementsByClassName('divTabCahierInfosDestination')[0].getElementsByTagName('input')[0],
            );
        });
    }

    const allNbrInvitesPropositions = location
        .getElementsByClassName('divTabCahierInfosNbrInvitesPropositions')[0]
        .getElementsByTagName('div');
    for (const elem of allNbrInvitesPropositions) {
        elem.addEventListener('mousedown', function () {
            if (this.innerHTML == 'Aucun') {
                location
                    .getElementsByClassName('divTabCahierInfosNbrInvites')[0]
                    .getElementsByTagName('input')[0].value = '0';
            } else {
                location
                    .getElementsByClassName('divTabCahierInfosNbrInvites')[0]
                    .getElementsByTagName('input')[0].value = '' + parseInt(this.innerHTML);
            }
            writeNbrInvites(
                location.getElementsByClassName('divTabCahierInfosNbrInvites')[0].getElementsByTagName('input')[0],
            );
        });
    }
}

export function focusInOrOut(elem: HTMLElement, focus: boolean): void {
    const allPropositions = elem
        .parentElement!.getElementsByClassName('PropositionsContainer')[0]
        .getElementsByTagName('div');
    for (let i = 0; i < allPropositions.length; i++) {
        if (focus) {
            setTimeout(enterProposition, i * 60, allPropositions[i]);
        } else {
            setTimeout(exitProposition, i * 60, allPropositions[allPropositions.length - i - 1]);
        }
    }
}

function enterProposition(elem: HTMLElement): void {
    elem.style.marginLeft = '0px';
    elem.style.marginRight = '10px';
    elem.style.opacity = '1';
}

function exitProposition(elem: HTMLElement): void {
    elem.style.marginLeft = '200px';
    elem.style.marginRight = '-190px';
    elem.style.opacity = '0';
}

function AcceptInfos(elem: HTMLElement): void {
    elem.style.backgroundImage = 'url(assets/navigations/icons/check-black.png)';
    elem.style.borderColor = 'black';
    elem.parentElement!.getElementsByTagName('div')[0].style.backgroundColor = 'black';
}
function DenyInfos(elem: HTMLElement): void {
    elem.style.backgroundImage = 'none';
}

export function checkInfos(location = $('divTabCahierInfos'), nbr = 0): void {
    const allTabCahierFields = location.getElementsByClassName('TabCahierFields');
    let allInfosOkay = true;
    for (let i = 0; i < allTabCahierFields.length - 1; i++) {
        //POUR EVITER LE TEXTAREA...
        if (
            allTabCahierFields[i].getElementsByTagName('input')[0].style.backgroundImage == '' ||
            allTabCahierFields[i].getElementsByTagName('input')[0].style.backgroundImage == 'none'
        ) {
            allTabCahierFields[i].getElementsByTagName('input')[0].style.borderColor = 'red';
            allTabCahierFields[i].getElementsByTagName('div')[0].style.backgroundColor = 'red';
            allInfosOkay = false;
        }
    }
    if (allInfosOkay) {
        const _participantCount = parseInt(
            location.getElementsByClassName('divTabCahierInfosNbrInvites')[0].getElementsByTagName('input')[0].value,
        );
        const _destination = location
            .getElementsByClassName('divTabCahierInfosDestination')[0]
            .getElementsByTagName('input')[0].value;
        const _startComment = location
            .getElementsByClassName('divTabCahierInfosStartComment')[0]
            .getElementsByTagName('textarea')[0].value;

        Cahier.setInfos(nbr, _participantCount, _destination, _startComment);

        if (location == $('divTabCahierInfos')) {
            newTab('divTabCahierEquipmentChoice');
        } else {
            closePopUp('last');
        }
    }
}
