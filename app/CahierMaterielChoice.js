function loadCahierMaterielChoice(loc = $('divTabCahierMaterielChoice').getElementsByClassName("MaterielChoiceContainer")[0],nbr = 0) {

    var isTab = true;
    if (loc != $('divTabCahierMaterielChoice').getElementsByClassName("MaterielChoiceContainer")[0]) {
        isTab = false;
    }     

    var container = div(loc);
    container.classList.add("divTabCahierMaterielChoiceContainer");

    var c = div(container);
    c.classList.add("divTabCahierMaterielChoiceInputCodeContainer");

    var i = input(c, "Taper le code...");
    i.onkeyup = function (event) {
        if (event.keyCode == 13) {
            Requests.getBookableByCode(this,nbr);
        }
        if (this.value != '') {
            this.nextElementSibling.nextElementSibling.children[0].classList.add("activated");
        }
        else { this.nextElementSibling.nextElementSibling.children[0].classList.remove("activated"); } 
    };

    if (!isTab) {
        i.focus();
    }

    div(c);

    var btn = div(div(c));
    btn.classList.add("ValidateButtons", "Buttons");
    btn.onclick = function () { Requests.getBookableByCode(this.parentElement.previousElementSibling.previousElementSibling,nbr); };

    div(container).innerHTML = "Par exemple: C32";

    div(container).innerHTML = "Ou";

    var btnContainer = div(container);

        var btn1 = div(btnContainer);
        btn1.innerHTML = "Prendre du matériel personel";
        if (isTab) {
            btn1.onclick = function () {
                Cahier.setBookable(nbr); newTab('divTabCahierInfos');
            };
        }
        else {
            btn1.onclick = function () {
                Cahier.setBookable(nbr);
                closePopUp("last");
            };
        }
        
        btn1.classList.add("NormalButtons", "Buttons");

        var btn2 = div(btnContainer);
        btn2.innerHTML = "Voir la liste du matériel";
        if (isTab) {
            btn2.onclick = function () { newTab('divTabCahierMaterielCategories'); };
        }
        else {
           // btn2.onclick = function () { alert('a'); };
            btn2.style.backgroundColor = "lightgray";
            btn2.style.opacity = 0.5;
            btn2.style.cursor = "no-drop";
        }
        btn2.classList.add("NormalButtons", "Buttons");
}