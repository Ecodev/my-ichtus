var MaterielElementsFirstLoad = false;

var currentResouces;


function popMateriel(resourceId,i = -1) {

   // alert(resourceId);

    Requests.getResourceInfos(resourceId);

    openPopUp();

    var pop = div($('divModal'));
    pop.id = "divTabCahierMaterielElementsPopUp";
    pop.classList.add("Boxes");

    var close = div(pop);
    close.onclick = function () {
        closePopUp({ target: $('divModal') });
    };

    var imgContainer = div(pop);
    imgContainer.id = i;

    var descriptionTitle = div(pop);
    descriptionTitle.innerHTML = "Description";

    var description = div(pop);
   // description.innerHTML = currentResouces[this.id].description;

    if (i != -1) {
        var btn = div(pop);
        btn.classList.add("Buttons"); btn.classList.add("ValidateButtons");
        btn.innerHTML = "Choisir";
        btn.addEventListener("click", function () {
            Cahier.resourceId = currentResouces[this.parentElement.getElementsByTagName("div")[1].id].id;
            Cahier.resourceName = currentResouces[this.parentElement.getElementsByTagName("div")[1].id].name;
            closePopUp({ target: $('divModal') });
            newTab("divTabCahierInfos");
        });
    }
 

    var btn2 = div(pop);
    btn2.classList.add("Buttons"); btn2.classList.add("ReturnButtons");
  //  btn2.innerHTML = "Historique";

    var textsContainer = div(pop);
    textsContainer.id = "divTabCahierMaterielElementsContainerTextsContainer";

    var name = div(textsContainer);
   // name.innerHTML = currentResouces[this.id].name;

    var id = div(textsContainer);
//    id.innerHTML = "ID: " + currentResouces[this.id].id;

    var creationDate = div(textsContainer);
 //   creationDate.innerHTML = currentResouces[this.id].creationDate + "<br/> Dernière utilisation date + personne, nbr total de sorties, catégorie?";

  
}

function actualizePopMateriel(resource) {
    $('divTabCahierMaterielElementsPopUp').getElementsByTagName("div")[3].innerHTML = resource[0].description;
    $('divTabCahierMaterielElementsContainerTextsContainer').getElementsByTagName("div")[0].innerHTML = resource[0].name;
    $('divTabCahierMaterielElementsContainerTextsContainer').getElementsByTagName("div")[1].innerHTML = "ID: " + resource[0].id;
    $('divTabCahierMaterielElementsContainerTextsContainer').getElementsByTagName("div")[2].innerHTML = "ID: " + resource[0].creationDate + "<br/> Dernière utilisation date + personne, nbr total de sorties, catégorie?";
}


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
                popMateriel(Resources[this.id].id, this.id);
            }); 
  
            $("divTabCahierMaterielElementsContainer").appendChild(container);

            var secondContainer = document.createElement("div");
            container.appendChild(secondContainer);

            var size = document.createElement("div");
            size.innerHTML = Resources[i].id;
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
