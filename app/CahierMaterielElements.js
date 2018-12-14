var MaterielElementsFirstLoad = false;

var currentBookables;


function popBookable(bookableId, i = -1) {

    // alert(bookableId);

    Requests.getBookableInfos(bookableId, function () { actualizePopBookable(result.items); });

    var modal = openPopUp();

    //var pop = div($('divModal'));
    var pop = div(modal);
    pop.id = "divTabCahierMaterielElementsPopUp";
    pop.classList.add("Boxes");

    var close = div(pop);
    close.id = "divPopUpClose";
    close.onclick = function () {
        closePopUp({target:modal},modal);
    };

    var imgContainer = div(pop);
    imgContainer.id = i;

    var descriptionTitle = div(pop);
    descriptionTitle.innerHTML = "Description";

    var description = div(pop);

    if (i != -1) {
        var btn = div(pop);
        btn.classList.add("Buttons"); btn.classList.add("ValidateButtons");
        btn.innerHTML = "Choisir";
        btn.addEventListener("click", function () {
            Cahier.bookableId = currentBookables[this.parentElement.getElementsByTagName("div")[1].id].id;
            Cahier.bookableName = currentBookables[this.parentElement.getElementsByTagName("div")[1].id].name;
            closePopUp({ target: modal},modal);
            newTab("divTabCahierInfos");
        });
    }


    var btn2 = div(pop);
    btn2.classList.add("Buttons"); btn2.classList.add("ReturnButtons");
    //  btn2.innerHTML = "Historique";

    var textsContainer = div(pop);
    textsContainer.id = "divTabCahierMaterielElementsContainerTextsContainer";

    div(textsContainer);
    div(textsContainer);
    div(textsContainer);
    div(textsContainer);
    div(textsContainer);

}

function actualizePopBookable(bookable) {
    $('divTabCahierMaterielElementsPopUp').getElementsByTagName("div")[3].innerHTML = bookable[0].description;
    $('divTabCahierMaterielElementsContainerTextsContainer').getElementsByTagName("div")[0].innerHTML = bookable[0].name.shorten(410, 25);
    $('divTabCahierMaterielElementsContainerTextsContainer').getElementsByTagName("div")[1].innerHTML = bookable[0].type.name + " / " + bookable[0].id;
    $('divTabCahierMaterielElementsContainerTextsContainer').getElementsByTagName("div")[2].innerHTML = "CODE: " + bookable[0].code;
    $('divTabCahierMaterielElementsContainerTextsContainer').getElementsByTagName("div")[3].innerHTML = "date: " + bookable[0].creationDate;

    //"Dernière utilisation date + personne, nbr total de sorties, catégorie?";
}

function loadElements(Bookables) {
    //var i = categories.findIndex(type);

    currentBookables = Bookables;
    //var nbrOfElements = 10;


    document.getElementById("divTabCahierMaterielElementsContainer").innerHTML = "";

        var container = document.createElement("div");
        container.addEventListener("click", function () {
            alert("materiel perso...");
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
        if (MaterielElementsFirstLoad == true) {
            MaterielElementsFirstLoad = false;
            //document.documentElement.scrollTop = 60;
        }
    // <div>     <div>       <div>7.0</div>          <div><div>Severne</div><div>Overdrive 2017</div></div>      <div></div><div></div>      </div>       </div>
}


Array.prototype.findIndex = function (x) {
    var Index = undefined;
    for (var i = 0; i < this.length; i++) {
        if (this[i].toString() == x.toString()) {
            Index = i;
            break;
        }
    }
    return Index;
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
