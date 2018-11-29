var MaterielElementsFirstLoad = false;

var currentResouces;

function loadElements(Resources) {
    //var i = categories.findIndex(type);

    currentResouces = Resources;
    //var nbrOfElements = 10;

    document.getElementById("divTabCahierMaterielElementsContainer").innerHTML = "";
    if (Resources.length == 0) {
        $("divTabCahierMaterielElementsContainer").innerHTML = "Pas de résultats";
    }
    else {
        for (var i = 0; i < Resources.length; i++) {

            var container = document.createElement("div");
            container.id = i;
            container.addEventListener("click", function () {
               // 
                openPopUp();

                var pop = div($('divModal'));
                pop.id = "divTabCahierMaterielElementsPopUp";
                pop.classList.add("Boxes");
                
                var close = div(pop);
                close.onclick = function () {
                    closePopUp({ target: $('divModal') });
                        };

                var imgContainer = div(pop);
                imgContainer.id = this.id;

                var descriptionTitle = div(pop);
                descriptionTitle.innerHTML = "Description";

                var description = div(pop);
                description.innerHTML = currentResouces[this.id].description;

                var btn = div(pop);
                btn.classList.add("Buttons"); btn.classList.add("ValidateButtons");
                btn.innerHTML = "Choisir";

                var btn2 = div(pop);
                btn2.classList.add("Buttons"); btn2.classList.add("ReturnButtons");
                btn2.innerHTML = "Historique";

                var textsContainer = div(pop);
                textsContainer.id = "divTabCahierMaterielElementsContainerTextsContainer";

                var name = div(textsContainer);
                name.innerHTML = currentResouces[this.id].name;

                var id = div(textsContainer);
                id.innerHTML = "ID: " + currentResouces[this.id].id;

                var creationDate = div(textsContainer);
                creationDate.innerHTML = currentResouces[this.id].creationDate + "<br/> Dernière utilisation date + personne, nbr total de sorties, catégorie?";              
              
                btn.addEventListener("click", function () {
                    Cahier.resourceId = currentResouces[this.parentElement.getElementsByTagName("div")[1].id].id;
                    Cahier.resourceName = currentResouces[this.parentElement.getElementsByTagName("div")[1].id].name;
                    closePopUp({ target: $('divModal') });
                    newTab("divTabCahierInfos");
                });


            });
            $("divTabCahierMaterielElementsContainer").appendChild(container);

            var secondContainer = document.createElement("div");
            container.appendChild(secondContainer);

            var size = document.createElement("div");
            size.innerHTML = i + "." + (i + 1);
            secondContainer.appendChild(size);

            var bottom = document.createElement("div");
            secondContainer.appendChild(bottom);

            var brand = document.createElement("div");
            brand.innerHTML = Resources[i].name;
            bottom.appendChild(brand);

            var model = document.createElement("div");
            model.innerHTML = Resources[i].id;
            bottom.appendChild(model);

            var info = document.createElement("div");
            secondContainer.appendChild(info);

            var background = document.createElement("div");
            secondContainer.appendChild(background);
        }
        if (MaterielElementsFirstLoad == true) {
            MaterielElementsFirstLoad = false;
            document.documentElement.scrollTop = 60;
        }
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
    if (elem.style.backgroundImage == 'url("Img/IconBack.png")') {
        elem.style.backgroundImage = 'url("Img/IconEnter.png")';
    }
    else {
        elem.style.backgroundImage = 'url("Img/IconBack.png")';
    }
} 
