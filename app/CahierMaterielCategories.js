var categories = ["Canoë & Kayak","SUP","Rame", "Planche à voile", "Voile"];
var categoriesValues = ["Canoe_Kayak","SUP", "Aviron", "Planche", "Voile"];
function loadMateriel(container = $("divTabCahierMaterielCategoriesContainer")) {
    inputTypeCodeMateriel = document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[0];
    inputNumberCodeMateriel = document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[1];

    for (var i = 0; i < categories.length; i++) {
        var d = document.createElement("div");
        d.id = categories[i];
        d.classList.add("BoxesContainer");
        container.appendChild(d);

        var d1 = div(d);
        d1.id = i;
        d1.classList.add("Boxes");

        var dTop = div(d1);
        dTop.classList.add("BoxesTop");
        dTop.style.backgroundImage = "url(Img/IconChose.png)," + "url(Img/Categorie/" + categoriesValues[i] + ".png)";
        console.log(i);

        var dBottom = document.createElement("div");
        dBottom.classList.add("BoxesBottom");
        d1.appendChild(dBottom);

        var dBottomText1 = document.createElement("div");
        dBottomText1.classList.add("BoxesBottomText1");
        dBottom.appendChild(dBottomText1);
        dBottomText1.innerHTML = categories[i];

        var dBottomText2 = document.createElement("div");
        dBottomText2.classList.add("BoxesBottomText2");
        dBottom.appendChild(dBottomText2);
        Requests.getBookableNbrForBookableTag(categoriesValues[i], dBottomText2, "", " " + categories[i] + "s");

        if (categoriesValues[i] == "MP") { // useless
            d.addEventListener("click", function () {
                Cahier.bookableId = "";
                Cahier.bookableName = "Matériel Personel";
                newTab("divTabCahierInfos");
           });
        }
        else {
            d.addEventListener("click", function () {
                newTab("divTabCahierMaterielElements");
                $('divTabCahierMaterielElementsSelectCategorie').getElementsByTagName("select")[0].getElementsByTagName("option")[parseInt(this.getElementsByTagName("div")[0].id) + 0].selected = "selected";
                changeSelectCategorie($('divTabCahierMaterielElementsSelectCategorie').getElementsByTagName("select")[0]);
            });
        }

        var opt = document.createElement("option");
        opt.innerHTML = categories[i];
        opt.value = categoriesValues[i];
        $('divTabCahierMaterielElementsSelectCategorie').getElementsByTagName("select")[0].appendChild(opt);
    }

    var opt = document.createElement("option");
    opt.innerHTML = "Toutes les catégories";
    opt.value = "all";
    $('divTabCahierMaterielElementsSelectCategorie').getElementsByTagName("select")[0].appendChild(opt);

}

