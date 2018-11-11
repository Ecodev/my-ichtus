function checkCodeMateriel() {
    if (document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[1].value != "1") {
        document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[0].style.borderColor = "red";
        document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[1].style.borderColor = "red";
        document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("div")[0].style.backgroundColor = "red";
    }
    else {
        document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[0].style.borderColor = "black";
        document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[1].style.borderColor = "black";
        document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("div")[0].style.backgroundColor = "black";
        changeProgress(2);
    }
}



var types = ["Canoé", "Kayak", "Planche à voile", "Voilier"];
function focusInOrOutInputTypeEmbarcation(elem, InOrOut) {
    document.getElementById("divTabCahierMaterielCodeEmbarcationTypeResults").innerHTML = "";

    if (InOrOut == true) {
        elem.value = "";
        for (var i = 0; i < types.length; i++) {
                var divResult = document.createElement("div");
                divResult.classList.add("divTabCahierMaterielCodeEmbarcationTypeResult");
                document.getElementById("divTabCahierMaterielCodeEmbarcationTypeResults").appendChild(divResult);

            divResult.addEventListener("mousedown", function () {
                document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[0].value = this.getElementsByClassName("spanTabMaterielCodeEmbarcationType")[0].innerHTML;
                AcceptDenyCodeEmbarcation();
            });

                var span1 = document.createElement("span");
                span1.classList.add("spanTabMaterielCodeEmbarcationTypeLetter");
                span1.innerHTML = types[i][0];
                divResult.appendChild(span1);

                var span2 = document.createElement("span");
                span2.classList.add("spanTabMaterielCodeEmbarcationType");
                span2.innerHTML = types[i];
                divResult.appendChild(span2);
        }
    }
}

function keyUpInputTypeEmbarcation(elem) {
    document.getElementById("divTabCahierMaterielCodeEmbarcationTypeResults").innerHTML = "";
    for (var i = 0; i < types.length; i++) {
        if (elem.value.toUpperCase() == types[i][0]) {
            document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[1].focus();
            elem.value = types[i];
        }
    }
    if (elem.value == "") {
        focusInOrOutInputTypeEmbarcation(elem, true);
    }
}


function AcceptDenyCodeEmbarcation(e) {

    if (e.keyCode == 13) {
        checkCodeMateriel();
    }

    //check
    if (document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[0].value == "Canoé" && document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[1].value == "1") {
        document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[1].style.backgroundImage = "url(Img/IconCheckSignBlack.png)";
    }
    else {
        document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[1].style.backgroundImage = "none";
    }
}


var categories = ["SUP", "Canoé", "Planche à voile", "Voilier","Kayak"];
function createCategories() {
    for (var i = 0; i < categories.length; i++) {
        var d = document.createElement("div");
        d.classList.add("divTabCahierMaterielBoxesContainer");
        d.innerHTML = "300x " + categories[i] + "s";
        document.getElementById("divTabCahierMaterielCategories").appendChild(d);
        
        var d1 = document.createElement("div");
        d1.classList.add("divTabCahierMaterielBoxes");
        d.appendChild(d1);

        var dTop = document.createElement("div");  
        dTop.classList.add("divTabCahierMaterielBoxesTop");
        d1.appendChild(dTop);

        var dBottom = document.createElement("div");
        dBottom.classList.add("divTabCahierMaterielBoxesBottom");
        d1.appendChild(dBottom);

        var dBottomText1 = document.createElement("div");
        dBottomText1.classList.add("divTabCahierMaterielBoxesBottomText1");
        dBottom.appendChild(dBottomText1);
        dBottomText1.innerHTML = categories[i];

        d.addEventListener("click", function () {

            changeTab(document.getElementById("divTabCahierMaterielElements"),1);
           //document.getElementById("divTabCahierMateriel").style.marginTop = "-1000px";



        });
    }
} 




function loadMateriel() {


}