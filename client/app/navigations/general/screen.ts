import {$} from './home';
import {Cahier} from '../cahier/methods';
import {writeDestination, writeNbrInvites} from '../infos/infos';
import {loadConfirmation} from '../cahier/pop-booking';
import {actualizeBookableList} from '../cahier/top-list';
import {changeProgress} from '../cahier/top';
import {Requests} from './server-requests';

let stillMoving = false;
export let currentTabElement: HTMLElement; //see load for the first element = divtabcahier
const changeTime = 0.3;

export function setCurrentTabElement(element: HTMLElement): void {
    currentTabElement = element;
}

function changeTab(newElement: HTMLElement, sign: number): void {
    stillMoving = true;

    document.documentElement.scrollTop = 0;

    currentTabElement.style.zIndex = '10';
    currentTabElement.style.transition = 'transform ' + changeTime + 's linear 0s,padding-right 0.3s linear 0s';

    newElement.style.zIndex = '5';

    currentTabElement.style.transform = 'translate(' + -sign + '00%)'; //element.style.transform = "translate(" + (-sign * widthToDisplay) + "px)"; //meme chose

    newElement.style.top = '0px';

    setTimeout(function () {
        currentTabElement.style.zIndex = '2';
        currentTabElement.style.transition = 'none';

        currentTabElement.style.transform = 'translate(0px)';

        setTimeout(function () {
            currentTabElement.style.transition =
                'transform ' + changeTime + 's linear 0s, padding-right 0.3s linear 0s';
        }, 30);
        setTimeout(function () {
            stillMoving = false;
            currentTabElement.style.top = '-30000px';
            setCurrentTabElement(newElement);
        }, 50);
    }, changeTime * 1000);
}

// newTab
export function newTab(id: string): void {
    if (!stillMoving) {
        window.location.href = 'navigations#' + id;
    }
}

// historyBackTab
export function historyBackTab(): void {
    window.history.back();
}

// tabs
export const tabs: {
    id: `div${string}`;
    order: number;
    progress: number;
    position: number;
    TopBar: boolean;
    ListBar: boolean;
    title: string;
    Enter: () => void;
    Remove: () => void;
}[] = [];

tabs.push({
    id: 'divTabCahier',
    order: 0,
    progress: 0,
    position: 0,
    TopBar: false,
    ListBar: false,
    title: 'Cahier de sortie',
    Enter: function () {
        Cahier.cancel();
    },
    Remove: () => undefined,
});
tabs.push({
    id: 'divTabCahierMember',
    order: 6,
    progress: 1,
    position: 0,
    TopBar: true,
    ListBar: false,
    title: 'Veuillez écrire votre nom et prénom',
    Enter: function () {
        $('divTabCahierMember').getElementsByTagName('input')[0].focus();
    },
    Remove: () => undefined,
});
tabs.push({
    id: 'divTabCahierInfos',
    order: 7,
    progress: 2,
    position: 0,
    TopBar: true,
    ListBar: false,
    title: 'Complétez les champs',
    Enter: function () {
        if (currentTabElement.id == 'divTabCahierMember') {
            document.getElementsByClassName('divTabCahierInfosNbrInvites')[0].getElementsByTagName('input')[0].focus();
            writeNbrInvites(
                document.getElementsByClassName('divTabCahierInfosNbrInvites')[0].getElementsByTagName('input')[0],
            );
            writeDestination(
                document.getElementsByClassName('divTabCahierInfosDestination')[0].getElementsByTagName('input')[0],
            );
        } else {
            document.getElementsByClassName('divTabCahierInfosNbrInvites')[0].getElementsByTagName('input')[0].value =
                Cahier.bookings[0].participantCount;
            document.getElementsByClassName('divTabCahierInfosDestination')[0].getElementsByTagName('input')[0].value =
                Cahier.bookings[0].destination;
            document
                .getElementsByClassName('divTabCahierInfosStartComment')[0]
                .getElementsByTagName('textarea')[0].value = Cahier.bookings[0].startComment;
            writeNbrInvites(
                document.getElementsByClassName('divTabCahierInfosNbrInvites')[0].getElementsByTagName('input')[0],
            );
            writeDestination(
                document.getElementsByClassName('divTabCahierInfosDestination')[0].getElementsByTagName('input')[0],
            );
        }
    },
    Remove: () => undefined,
});
tabs.push({
    id: 'divTabCahierEquipmentChoice',
    order: 9,
    progress: 3,
    position: 0,
    TopBar: true,
    ListBar: true,
    title: 'Tapez les codes de vos embarcations',
    Enter: function () {
        document
            .getElementsByClassName('divTabCahierEquipmentChoiceInputCodeContainer')[0]
            .getElementsByTagName('input')[0]
            .focus();
        document
            .getElementsByClassName('divTabCahierEquipmentChoiceInputCodeContainer')[0]
            .getElementsByTagName('input')[0].value = '';
    },
    Remove: () => undefined,
});
tabs.push({
    id: 'divTabCahierEquipmentBookable',
    order: 10,
    progress: 3,
    position: 0,
    TopBar: true,
    ListBar: true,
    title: 'Validez cette embarcation',
    Enter: () => undefined,
    Remove: () => undefined,
});
tabs.push({
    id: 'divTabCahierEquipmentCategories',
    order: 12,
    progress: 3,
    position: 0,
    TopBar: true,
    ListBar: true,
    title: "Veuillez choisir votre type d'activité",
    Enter: () => undefined,
    Remove: () => undefined,
});
tabs.push({
    id: 'divTabCahierEquipmentElements',
    order: 13,
    progress: 3,
    position: 0,
    TopBar: true,
    ListBar: true,
    title: 'Sélectionnez vos embarcations',
    Enter: function () {
        Requests.getBookablesList(); //$('inputTabCahierEquipmentElementsInputSearch').focus();
        ($('divTabCahierTopList').children[1] as HTMLElement).style.opacity = '1';
    },
    Remove: function () {
        ($('divTabCahierTopList').children[1] as HTMLElement).style.opacity = '0';
    },
});
tabs.push({
    id: 'divTabCahierConfirmation',
    order: 15,
    progress: 4,
    position: 0,
    TopBar: true,
    ListBar: false,
    title: 'Confirmez et créez votre sortie',
    Enter: function () {
        loadConfirmation();
    },
    Remove: () => undefined,
});

//WINDOW LOCATION CHANGE
let OldElement = tabs[0];
let NewElement = tabs[0];
window.onhashchange = function () {
    const newLocation = window.location.toString();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const res = newLocation.substr(newLocation.indexOf('#') + 1);

    if (res != currentTabElement.id) {
        //onload refresh

        for (const item of tabs) {
            if (item.id == res) {
                NewElement = item;
                break;
            }
        }

        let sign = 1;
        if (NewElement.progress == 0 && OldElement.progress != 0 && NewElement.id != 'divTabCahier') {
            sign = NewElement.order;
        } else if (NewElement.order < OldElement.order) {
            sign = -1;
        }

        changeTab($(NewElement.id), sign);

        // TopBar Enter/Remove
        if (NewElement.TopBar && !OldElement.TopBar) {
            enterProgressBar();
        } else if (!NewElement.TopBar && OldElement.TopBar) {
            removeProgressBar(sign);
        }

        // ListBar Enter/Remove
        if (NewElement.ListBar && !OldElement.ListBar) {
            enterListBar();
            actualizeBookableList();
        } else if (!NewElement.ListBar && OldElement.ListBar) {
            removeListBar(sign);
        }

        // Enter & Remove Functions
        NewElement.Enter();
        OldElement.Remove();

        // Change Title
        if (NewElement.title != undefined) {
            $('divTopBarText').innerHTML = NewElement.title;
        } else {
            $('divTopBarText').innerHTML = '?';
        }

        // change ProgressBar
        changeProgress(NewElement.progress);

        // actualize Progress Bar // AFTER CHANGING PROGRESS
        Cahier.actualizeProgressBar();

        // save OldElement
        OldElement = NewElement;
    }
};

//ENTER PROGRESS BAR
function enterProgressBar(): void {
    $('divTabCahierTop').style.zIndex = '6';
    setTimeout(function () {
        $('divTabCahierTop').style.zIndex = '11';
    }, changeTime * 1000);
}

//REMOVE PROGRESS BAR
function removeProgressBar(sign: number): void {
    $('divTabCahierTop').style.zIndex = '11'; //11
    $('divTabCahierTop').style.transition = 'transform ' + changeTime + 's linear 0s';
    $('divTabCahierTop').style.transform = 'translate(' + -sign + '00%)';

    setTimeout(function () {
        $('divTabCahierTop').style.zIndex = '2';
        $('divTabCahierTop').style.transition = 'none';

        $('divTabCahierTop').style.transform = 'translate(0px)';

        setTimeout(function () {
            $('divTabCahierTop').style.transition = 'transform ' + changeTime + 's linear 0s';
        }, 20);
    }, changeTime * 1000);
}

//ENTER LIST BAR
function enterListBar(): void {
    $('divTabCahierTopList').style.zIndex = '6';
    setTimeout(function () {
        $('divTabCahierTopList').style.zIndex = '10';
    }, changeTime * 1000);
}

//REMOVE LIST BAR
function removeListBar(sign: number): void {
    $('divTabCahierTopList').style.zIndex = '10'; //10
    $('divTabCahierTopList').style.transition = 'transform ' + changeTime + 's linear 0s';
    $('divTabCahierTopList').style.transform = 'translate(' + -sign + '00%)';

    setTimeout(function () {
        $('divTabCahierTopList').style.zIndex = '2';
        $('divTabCahierTopList').style.transition = 'none';

        $('divTabCahierTopList').style.transform = 'translate(0px)';

        setTimeout(function () {
            $('divTabCahierTopList').style.transition = 'transform ' + changeTime + 's linear 0s';
        }, 20);
    }, changeTime * 1000);
}
