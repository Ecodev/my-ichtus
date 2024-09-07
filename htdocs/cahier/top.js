import {$} from '../general/home.js';
import {newTab} from '../general/screen.js';
import {Cahier} from './methods.js';
//ProgressBar

export const progessionTabNames = [
    'divTabCahier',
    'divTabCahierMember',
    'divTabCahierInfos',
    'divTabCahierEquipmentChoice',
    'divTabCahierConfirmation',
];

export function createProgressBar() {
    for (let i = 0; i < 4; i++) {
        let divStep = document.createElement('div');
        divStep.classList.add('divTabCahierProgressStep');
        divStep.style.left = 6 + 26 * i + '%';
        divStep.addEventListener('click', function () {
            let c = (parseInt(this.style.left) - 6) / 26 + 1;
            if (c <= currentProgress) {
                if (
                    progessionTabNames[c] != 'divTabCahierMember' ||
                    !$('divTabCahierProgress').classList.contains('editing')
                ) {
                    newTab(progessionTabNames[c]);
                }
            }
        });

        $('divTabCahierProgress').appendChild(divStep);
        divStep.classList.add('divTabCahierProgressStepCompleted');

        let divNumber = document.createElement('div');
        divNumber.classList.add('divTabCahierProgressNumber');
        divNumber.innerHTML = i + 1;
        divStep.appendChild(divNumber);

        let divCircle = document.createElement('div');
        divCircle.classList.add('divTabCahierProgressCircle');
        divStep.appendChild(divCircle);

        let divText = document.createElement('div');
        divText.classList.add('divTabCahierProgressText');
        divText.innerHTML = Cahier.ProgressBarTexts[i];
        divStep.appendChild(divText);
    }

    let divBar = document.createElement('div');
    divBar.id = 'divTabCahierProgressBar';
    divBar.style.left = 11 + 26 * 0 + '%';
    $('divTabCahierProgress').appendChild(divBar);

    let divBarBlue = document.createElement('div');
    divBarBlue.id = 'divTabCahierProgressBarBlue';
    divBarBlue.style.left = 11 + 26 * 0 + '%';
    $('divTabCahierProgress').appendChild(divBarBlue);
}

export let currentProgress = 0;

export function changeProgress(c) {
    currentProgress = c;
    for (let i = 1; i < 5; i++) {
        document.getElementsByClassName('divTabCahierProgressStep')[i - 1].className = 'divTabCahierProgressStep';
        if (i < c) {
            document
                .getElementsByClassName('divTabCahierProgressStep')
                [i - 1].classList.add('divTabCahierProgressStepCompleted');
        } else if (i == c) {
            document
                .getElementsByClassName('divTabCahierProgressStep')
                [i - 1].classList.add('divTabCahierProgressStepCurrent');
        } else {
            document
                .getElementsByClassName('divTabCahierProgressStep')
                [i - 1].classList.add('divTabCahierProgressStepIncompleted');
        }
    }

    $('divTabCahierProgressBarBlue').style.width = (c - 1) * 26 + '%';
}
