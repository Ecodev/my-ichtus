var currentBookables;
function loadElements(bookables ,nbr = 0) {

    currentBookables = bookables;

    console.log(currentBookables);

    document.getElementsByClassName("divTabCahierEquipmentElementsContainer")[0].innerHTML = "";

    var codes = [];
    for (var i = 0; i < Cahier.bookings[nbr].bookables.length; i++) {
        codes.push(Cahier.bookings[nbr].bookables[i].code);
    }

    for (var i = 0; i < bookables.length; i++) {

        container = document.createElement("div");
        container.id = i;

        if (bookables[i].used === true) {
            container.classList.add("used");
            container.title = "Cette embarcation est déjà utilisée";
        }

        var x = codes.findIndex(bookables[i].code);

        if (x !== -1) {
            container.classList.add("selected");
            container.onclick = function (event) {
                if (!(event.target.classList.contains("infoJS"))) {
                    Cahier.removeBookable(nbr, bookables[this.id]);
                    actualizeElements();
                }
            };
        }
        else {
            container.onclick = function (event) {
                if (!(event.target.classList.contains("infoJS"))) {
                    Cahier.addBookable(nbr, bookables[this.id]);
                    actualizeElements();
                }
            };
        }

        document.getElementsByClassName("divTabCahierEquipmentElementsContainer")[0].appendChild(container);

        var secondContainer = document.createElement("div");
        container.appendChild(secondContainer);

        var size = document.createElement("div");
        if (bookables[i].code.length > 4) {
            size.style.fontSize = "17px";
        }
        size.innerHTML = bookables[i].code;
        secondContainer.appendChild(size);

        var bottom = document.createElement("div");
        secondContainer.appendChild(bottom);

        var brand = div(bottom);
        brand.innerHTML = bookables[i].name.shorten(160*2,20);

      //  model = div(bottom);
      //  model.innerHTML = bookables[i].id;

        var background = div(secondContainer);
        background.style.backgroundImage = Cahier.getImageUrl(bookables[i]);

        var selection = div(secondContainer);

        var info = div(secondContainer);
        info.id = bookables[i].id;
        info.classList.add("infoJS");
        info.onclick = function () {
            popBookable(this.id);
        };



        if (bookables[i].licenses.length > 0) {
            var license = div(secondContainer);
            license.title = bookables[i].licenses[0].name;
        }

        if (bookables[i].used) {
            var used = div(container);
            used.innerHTML = "Déjà utilisé";
        }


    }
    if (bookables.length == 0) {
        var d = div(document.getElementsByClassName("divTabCahierEquipmentElementsContainer")[0]);
        d.innerHTML = "Aucun résultat";
        //console.log('Aucun résultat');
    }
}



function actualizeElements() {

    var bookables = currentBookables;

    var codes = [];
    for (var i = 0; i < Cahier.bookings[0].bookables.length; i++) {
        codes.push(Cahier.bookings[0].bookables[i].code);
    }

    var containers = document.getElementsByClassName("divTabCahierEquipmentElementsContainer")[0].children;

    for (var i = 0; i < containers.length; i++) {

        var container = containers[i];

        if (codes.findIndex(bookables[i].code) != -1) {
            container.classList.add("selected");
            container.onclick = function (event) {
                if (!(event.target.classList.contains("infoJS"))) {
                    Cahier.removeBookable(0, bookables[this.id]);
                    actualizeElements();
                }
            };
        }
        else {
            container.classList.remove("selected");
            container.onclick = function (event) {
                if (!(event.target.classList.contains("infoJS"))) {
                    Cahier.addBookable(0, bookables[this.id]);
                    actualizeElements();
                }
            };
        }
    }
}

function clickSortIcon(elem) {
    if (elem.style.backgroundImage == 'url("img/icons/sort-desc.png")') {
        elem.style.backgroundImage = 'url("img/icons/sort-asc.png")';
    }
    else {
        elem.style.backgroundImage = 'url("img/icons/sort-desc.png")';
    }
}


function changeSelectCategorie(elem) {
    $('divTabCahierEquipmentElementsSelectCategorie').getElementsByTagName("div")[0].style.backgroundImage = "url(img/categorie/" + elem.value + ".png)";
}
