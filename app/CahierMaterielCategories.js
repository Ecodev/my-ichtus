var categories = ["Lorem..","Fusce...","SUP", "Canoé", "Planche à voile", "Voilier", "Kayak"];
var categoriesValues = ["Lorem ipsum","Fusce Cursus","SUP", "Canoé", "PlancheAVoile", "Voilier", "Kayak"];
function loadMateriel() {
    inputTypeCodeMateriel = document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[0];
    inputNumberCodeMateriel = document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[1];

    for (var i = 0; i < categories.length; i++) {
        var d = document.createElement("div");
        d.id = categories[i];
        d.classList.add("BoxesContainer");
        d.innerHTML = "300x " + categories[i] + "s";
        document.getElementById("divTabCahierMaterielCategoriesContainer").appendChild(d);

        var d1 = div(d);
        d1.id = i;
        d1.classList.add("Boxes");

        var dTop = document.createElement("div");
        dTop.classList.add("BoxesTop");
        d1.appendChild(dTop);

        var dBottom = document.createElement("div");
        dBottom.classList.add("BoxesBottom");
        d1.appendChild(dBottom);

        var dBottomText1 = document.createElement("div");
        dBottomText1.classList.add("BoxesBottomText1");
        dBottom.appendChild(dBottomText1);
        dBottomText1.innerHTML = categories[i];

        d.addEventListener("click", function () {
            newTab("divTabCahierMaterielElements");
            $('divTabCahierMaterielElementsSelectCategorie').getElementsByTagName("select")[0].getElementsByTagName("option")[parseInt(this.getElementsByTagName("div")[0].id) + 1].selected = "selected";
            changeSelectCategorie($('divTabCahierMaterielElementsSelectCategorie').getElementsByTagName("select")[0]);
        });



        

        var opt = document.createElement("option");
        opt.innerHTML = categories[i];
        opt.value = categoriesValues[i];
        $('divTabCahierMaterielElementsSelectCategorie').getElementsByTagName("select")[0].appendChild(opt);


    }
}