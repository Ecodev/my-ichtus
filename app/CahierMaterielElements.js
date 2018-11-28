var MaterielElementsFirstLoad = false;
function loadElements(Resources) {
    //var i = categories.findIndex(type);


    //var nbrOfElements = 10;

    document.getElementById("divTabCahierMaterielElementsContainer").innerHTML = "";
    if (Resources.length == 0) {
        $("divTabCahierMaterielElementsContainer").innerHTML = "Pas de résultats";
    }
    else {
        for (var i = 0; i < Resources.length; i++) {

            var container = document.createElement("div");
            container.id = Resources[i].id + ";" + Resources[i].name;
            container.addEventListener("click", function () {
               // newTab("divTabCahierInfos");
                openPopUp();

                var pop = div($('divModal'));
                pop.id = "divTabCahierMaterielElementsPopUp";
                pop.classList.add("Boxes");
                

                var close = div(pop);
                close.innerHTML = "jjaj";
               
                Cahier.resourceId = this.id.split(";")[0];
                Cahier.resourceName = this.id.split(";")[1];
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
