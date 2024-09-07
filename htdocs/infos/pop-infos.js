function popCahierInfos(nbr = 0) {
    let elem = openPopUp();

    let container;
    container = div(elem);
    container.id = nbr;
    container.classList.add('PopUpCahierInfosContainer');
    container.classList.add('Boxes');

    let close = div(container);
    close.className = 'divPopUpClose';
    close.onclick = function () {
        closePopUp({target: elem}, elem);
    };

    let d = div(container);
    d.style.textAlign = 'center';
    d.style.fontSize = '25px';
    d.innerHTML = 'Informations';

    grayBar(container, 5);

    let c = div(container);
    c.classList.add('divTabCahierFieldsContainer');

    let divParticipantCount = div(c);
    divParticipantCount.classList.add('TabCahierFields');
    divParticipantCount.classList.add('divTabCahierInfosNbrInvites');
    divParticipantCount.innerHTML += 'Nbr de participants';

    let i = input(divParticipantCount);
    i.type = 'number';
    i.min = '1';
    i.value = Cahier.bookings[nbr].participantCount;
    i.placeholder = '1';
    i.addEventListener('keyup', function () {
        writeNbrInvites(this);
    });
    i.addEventListener('focusin', function () {
        if (this.value == '1') {
            this.value = '';
        }
        writeNbrInvites(this);
        focusInOrOut(this, true);
    });
    i.addEventListener('focusout', function () {
        if (this.value == '') {
            this.value = '1';
            writeNbrInvites(this);
        }
        focusInOrOut(this, false);
    });

    div(divParticipantCount);

    let p = div(divParticipantCount);
    p.classList.add('PropositionsContainer');
    p.classList.add('divTabCahierInfosNbrInvitesPropositions');
    div(p).innerHTML = '1';
    div(p).innerHTML = '2';
    div(p).innerHTML = '3';
    div(p).innerHTML = '4';
    div(p).innerHTML = '5';
    div(p).innerHTML = '8';
    div(p).innerHTML = '10';

    let info = div(divParticipantCount);
    info.innerHTML = '(Vous inclu / minimum 1)';
    info.style.position = 'absolute';
    info.style.marginTop = '110px';
    info.style.textAlign = 'center';
    info.style.width = '100%';
    info.style.fontSize = '15px';

    writeNbrInvites(i);

    let divDestination = div(c);
    divDestination.classList.add('TabCahierFields');
    divDestination.classList.add('divTabCahierInfosDestination');
    divDestination.innerHTML += 'Destination';

    let ii = input(divDestination);
    ii.value = Cahier.bookings[nbr].destination;
    ii.placeholder = 'Destination';
    ii.addEventListener('keyup', function () {
        writeDestination(this);
    });
    ii.addEventListener('focusin', function () {
        writeDestination(this);
        focusInOrOut(this, true);
    });
    ii.addEventListener('focusout', function () {
        writeDestination(this);
        focusInOrOut(this, false);
    });

    div(divDestination);

    let pp = div(divDestination);
    pp.classList.add('PropositionsContainer');
    pp.classList.add('divTabCahierInfosDestinationPropositions');
    div(pp).innerHTML = 'Baie';
    div(pp).innerHTML = 'La Ramée';
    div(pp).innerHTML = 'La Tène';
    div(pp).innerHTML = 'Neuchâtel';
    div(pp).innerHTML = 'Hauterive';

    writeDestination(ii);

    let divStartComment = div(c);
    divStartComment.classList.add('TabCahierFields');
    divStartComment.classList.add('divTabCahierInfosStartComment');
    divStartComment.innerHTML += 'Commentaire';

    let area = document.createElement('textarea');
    divStartComment.appendChild(area);
    area.value = Cahier.bookings[nbr].startComment;
    area.spellcheck = false;
    area.placeholder = 'Informations, numéro de téléphone, heure estimée de retour...';

    div(divStartComment).style.height = '100px';

    createAllPropositions(c);

    let btnContainer = div(container);
    btnContainer.style.position = 'relative';
    btnContainer.style.textAlign = 'center';

    let btn = div(btnContainer);
    btn.classList.add('Buttons');
    btn.classList.add('ValidateButtons');
    btn.style.display = 'inline-block';
    btn.innerHTML = 'Valider';
    btn.addEventListener('click', function () {
        checkInfos(elem, nbr);
    });
}
