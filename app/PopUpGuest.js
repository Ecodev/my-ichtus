function popGuest() {
    var elem = openPopUp();

    var container;
    container = div(elem);
    container.classList.add("PopUpGuestContainer");
    container.classList.add("Boxes");

    var close = div(container);
    close.className = "divPopUpClose";
    close.onclick = function () {
        closePopUp({ target: elem }, elem);
    };

    var d = div(container);
    d.style.textAlign = "center";
    d.style.fontSize = "25px";
    d.innerHTML = "Nom et prénom de l'invité";

    grayBar(container, 5);

    var i1 = document.createElement("input");
    i1.placeholder = "Nom";
    i1.spellcheck = "false";
    container.appendChild(i1);

    var i2 = document.createElement("input");
    i2.placeholder = "Prénom";
    i2.spellcheck = "false";
    container.appendChild(i2);

    var b = div(container);
    b.classList.add("Buttons");
    b.classList.add("ValidateButtons");
    b.innerHTML = "Valider";
    b.addEventListener("click", function () {
        chosePerson("Invité", this.parentElement.getElementsByTagName("input")[0].value.capitalize() + " " + this.parentElement.getElementsByTagName("input")[1].value.capitalize(),""); //null undefined nan ?
        closePopUp({ target: elem }, elem);
    });
}



String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}