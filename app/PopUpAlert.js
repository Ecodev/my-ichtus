function popAlert(txt = "haha ahah ahah ") {

    var elem = openPopUp();

    var container;
    container = div(elem);
    container.classList.add("PopUpAlertContainer");
    container.classList.add("Boxes");

    var close = div(container);
    close.className = "divPopUpClose";
    close.onclick = function () {
        closePopUp({ target: elem }, elem);
    };

    var d = div(container);
    d.style.textAlign = "center";
    d.style.fontSize = "25px";
    d.innerHTML = "!";

    grayBar(container, 5);

    var t = div(container);
    t.innerHTML = txt;

}