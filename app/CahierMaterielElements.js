function loadElements(Resources) {
    //var i = categories.findIndex(type);


    //var nbrOfElements = 10;

    document.getElementById("divTabCahierMaterielElementsContainer").innerHTML = "";
    for (var i = 0; i < Resources.length; i++) {

        var container = document.createElement("div");
        container.addEventListener("click", function () {
            newTab("divTabCahierInfos");

        });
        document.getElementById("divTabCahierMaterielElementsContainer").appendChild(container);

            var secondContainer = document.createElement("div");
            container.appendChild(secondContainer);

                var size = document.createElement("div");
                 size.innerHTML = i + "." +(i+1);
                secondContainer.appendChild(size);

                var bottom = document.createElement("div");
                secondContainer.appendChild(bottom);

                    var brand = document.createElement("div");
                    brand.innerHTML = Resources[i].name;
                    bottom.appendChild(brand);

                    var model = document.createElement("div");
                    model.innerHTML = "Modèle" + " " + Resources[i].id;
                    bottom.appendChild(model);

                var info = document.createElement("div");
                secondContainer.appendChild(info);

                var background = document.createElement("div");
                secondContainer.appendChild(background);
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