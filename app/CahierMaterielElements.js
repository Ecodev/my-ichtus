var currentBookables;


function loadElements(Bookables) {

    currentBookables = Bookables;

    document.getElementById("divTabCahierMaterielElementsContainer").innerHTML = "";

    if ($('inputTabCahierMaterielElementsInputSearch').value == "") {

        var container = document.createElement("div");
        container.addEventListener("click", function () {
            Cahier.bookableId = "";
            Cahier.bookableName = "Matériel Personel";
            console.log(Cahier.bookableId);
            newTab("divTabCahierInfos");
        });

        $("divTabCahierMaterielElementsContainer").appendChild(container);

        var secondContainer = document.createElement("div");
        container.appendChild(secondContainer);

        var size = document.createElement("div");
        size.innerHTML = "M.P.";
        secondContainer.appendChild(size);

        var bottom = document.createElement("div");
        secondContainer.appendChild(bottom);

        var brand = div(bottom);
        brand.innerHTML = "Materiel";

        var model = div(bottom);
        model.innerHTML = "Personel";

        var background = div(secondContainer);
        background.style.backgroundImage = "url(Img/IconChose.png),url(Img/IconMan.png)";

    }

    for (var i = 0; i < Bookables.length; i++) {

        container = document.createElement("div");
        container.id = i;
        container.addEventListener("click", function () {
            popBookable(Bookables[this.id].id, this.id);
        });

        $("divTabCahierMaterielElementsContainer").appendChild(container);

        secondContainer = document.createElement("div");
        container.appendChild(secondContainer);

        size = document.createElement("div");
        size.innerHTML = Bookables[i].code;
        secondContainer.appendChild(size);

        bottom = document.createElement("div");
        secondContainer.appendChild(bottom);

        brand = div(bottom);
        brand.innerHTML = Bookables[i].name.shorten(180);

        model = div(bottom);
        model.innerHTML = Bookables[i].id;

        //var info = div(secondContainer);

        background = div(secondContainer);

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
