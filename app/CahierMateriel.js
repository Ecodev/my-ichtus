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


var categories = ["SUP", "Canoé/Kayak", "Planche à voile", "Voilier"];
function createCategories() {
    for (var i = 0; i < categories.length; i++) {
        var d = document.createElement("div");
        d.innerHTML = categories[i];
        document.getElementById("divTabCahierMaterielCategories").appendChild(d);
        
        var d1 = document.createElement("div");
        d.appendChild(d1);

        var d2 = document.createElement("div");
        d2.innerHTML = categories[i];
        d1.appendChild(d2);
    }
} 




function loadMateriel() {


}