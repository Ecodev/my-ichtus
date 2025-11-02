import {$} from '../general/home';
import {newTab} from '../general/screen';
import {Cahier} from './methods';
//ProgressBar

export const progessionTabNames = [
    'divTabCahier',
    'divTabCahierMember',
    'divTabCahierInfos',
    'divTabCahierEquipmentChoice',
    'divTabCahierConfirmation',
];

export function createProgressBar(): void {
    for (let i = 0; i < 4; i++) {
        const divStep = document.createElement('div');
        divStep.classList.add('divTabCahierProgressStep');
        divStep.style.left = 6 + 26 * i + '%';
        divStep.addEventListener('click', function () {
            const c = (parseInt(this.style.left) - 6) / 26 + 1;
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

        const divNumber = document.createElement('div');
        divNumber.classList.add('divTabCahierProgressNumber');
        divNumber.innerHTML = '' + (i + 1);
        divStep.appendChild(divNumber);

        const divCircle = document.createElement('div');
        divCircle.classList.add('divTabCahierProgressCircle');
        divStep.appendChild(divCircle);

        const divText = document.createElement('div');
        divText.classList.add('divTabCahierProgressText');
        divText.innerHTML = Cahier.ProgressBarTexts[i];
        divStep.appendChild(divText);
    }

    const divBar = document.createElement('div');
    divBar.id = 'divTabCahierProgressBar';
    divBar.style.left = 11 + 26 * 0 + '%';
    $('divTabCahierProgress').appendChild(divBar);

    const divBarBlue = document.createElement('div');
    divBarBlue.id = 'divTabCahierProgressBarBlue';
    divBarBlue.style.left = 11 + 26 * 0 + '%';
    $('divTabCahierProgress').appendChild(divBarBlue);
}

export let currentProgress = 0;

export function changeProgress(c: number): void {
    currentProgress = c;
    for (let i = 1; i < 5; i++) {
        const elem = document.getElementsByClassName('divTabCahierProgressStep');
        elem[i - 1].className = 'divTabCahierProgressStep';
        if (i < c) {
            elem[i - 1].classList.add('divTabCahierProgressStepCompleted');
        } else if (i == c) {
            elem[i - 1].classList.add('divTabCahierProgressStepCurrent');
        } else {
            elem[i - 1].classList.add('divTabCahierProgressStepIncompleted');
        }
    }

    $('divTabCahierProgressBarBlue').style.width = (c - 1) * 26 + '%';
}
