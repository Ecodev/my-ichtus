var currentBookables;
function loadElements(bookables ,nbr = 0) {

    currentBookables = bookables;

    document.getElementsByClassName("divTabCahierMaterielElementsContainer")[0].innerHTML = "";

    if ($('inputTabCahierMaterielElementsInputSearch').value == "" && false) { // no more personal sail, the choice could already have been done...

        var container = document.createElement("div");
        container.addEventListener("click", function () {
            Cahier.addBookable(nbr);
            newTab("divTabCahierInfos");
        });

        $("divTabCahierMaterielElementsContainer").appendChild(container);

        var secondContainer = document.createElement("div");
        container.appendChild(secondContainer);

        var size = document.createElement("div");
        size.style.visibility = "hidden";
        secondContainer.appendChild(size);

        var bottom = document.createElement("div");
        secondContainer.appendChild(bottom);

        var brand = div(bottom);
        brand.innerHTML = "Materiel";
        brand.style.color = "black";

        var model = div(bottom);
        model.innerHTML = "Personel";

        var background = div(secondContainer);
        background.style.backgroundImage = "url(Img/IconChose.png),url(Img/IconPersonalSail.png)";

    }

    var codes = [];
    for (var i = 0; i < Cahier.bookings[nbr].bookables.length; i++) {
        codes.push(Cahier.bookings[nbr].bookables[i].code);
    }

    for (var i = 0; i < bookables.length; i++) {

        container = document.createElement("div");
        container.id = i;

        if (codes.findIndex(bookables[i].code) != -1) {
            container.classList.add("selected");
            container.addEventListener("click", function () {
                Cahier.removeBookable(nbr, bookables[this.id]);
                loadElements(currentBookables);
            });
        }
        else {
            container.addEventListener("click", function () {
                //popBookable(bookables[this.id].id, false, 0, this.id);
                Cahier.addBookable(nbr, bookables[this.id]);
                loadElements(currentBookables);               
            });
        }

        document.getElementsByClassName("divTabCahierMaterielElementsContainer")[0].appendChild(container);

        secondContainer = document.createElement("div");
        container.appendChild(secondContainer);

        size = document.createElement("div");
        size.innerHTML = bookables[i].code;
        secondContainer.appendChild(size);

        bottom = document.createElement("div");
        secondContainer.appendChild(bottom);

        brand = div(bottom);
        brand.innerHTML = bookables[i].name.shorten(180*2,20);

      //  model = div(bottom);
      //  model.innerHTML = bookables[i].id;

        //var info = div(secondContainer);

        background = div(secondContainer);

    }
    if (bookables.length == 0) {
        var d = div($("divTabCahierMaterielElementsContainer"));
        d.innerHTML = "Aucun résultat";
        console.log('Aucun résultat');
    }
}




function clickSortIcon(elem) {
    if (elem.style.backgroundImage == 'url("Img/IconSortDESC.png")') {
        elem.style.backgroundImage = 'url("Img/IconSortASC.png")';
    }
    else {
        elem.style.backgroundImage = 'url("Img/IconSortDESC.png")';
    }
}


function changeSelectCategorie(elem) {
    $('divTabCahierMaterielElementsSelectCategorie').getElementsByTagName("div")[0].style.backgroundImage = "url(Img/Categorie/" + elem.value + ".png)";
}
