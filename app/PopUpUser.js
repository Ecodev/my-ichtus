function popUser() {
    var elem = openPopUp();

    var container;
    container = div(elem);
    container.classList.add("PopUpUserContainer");
    container.classList.add("Boxes");

    var close = div(container);
    close.className = "divPopUpClose";
    close.onclick = function () {
        closePopUp({ target: elem }, elem);
    };

    var d = div(container);
    d.style.textAlign = "center";
    d.style.fontSize = "25px";
    d.innerHTML = "Nom et prénom du membre";

    grayBar(container, 5);

    var i1 = document.createElement("input");
    i1.autocomplete = "off";
    i1.id = "inputTabCahierSearch";
    i1.title = "Veuillez écrire votre nom et prénom";
    i1.spellcheck = "false";
    i1.type = "text";
    i1.placeholder = "Entrez votre nom, pérnom...";
    i1.onkeyup = function(){Search(event);};
    i1.onkeydown = function () {SearchDown(event);};
    container.appendChild(i1);
    i1.focus();

    var d = div(container);
    d.id = "divTabCahierSearchResult";

    Search({ keyCode: 1 });
}