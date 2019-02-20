function popCahierBookable(nbr) {

    var elem = openPopUp();

    var container;
    container = div(elem);
    container.id = nbr;
    container.classList.add("PopUpCahierBookableContainer");
    container.classList.add("Boxes");

    var close = div(container);
    close.className = "divPopUpClose";
    close.onclick = function () {
        closePopUp({ target: elem }, elem);
    };

    var d = div(container);
    d.style.textAlign = "center";
    d.style.fontSize = "25px";
    d.innerHTML = "Embarcation";

    grayBar(container, 5);

    loadMateriel(container);
}