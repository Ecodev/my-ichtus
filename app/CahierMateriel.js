function checkCodeMateriel() {
    if (inputTypeCodeMateriel.value.toUpperCase() == "Canoé".toUpperCase() && inputNumberCodeMateriel.value == "1") {
        return true;
 
    }
    else {
        return false;
    
    }
}

function actualizeCodeMateriel() { //v sign or not
    if (checkCodeMateriel()) {
        inputNumberCodeMateriel.style.backgroundImage = "url(Img/IconCheckSignBlack.png)";
        inputTypeCodeMateriel.style.borderColor = "black";
        inputNumberCodeMateriel.style.borderColor = "black";
        document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("div")[0].style.backgroundColor = "black";
     
    }
    else {
        inputNumberCodeMateriel.style.backgroundImage = "none";
    }
}


function validateCodeMateriel() {
    if (checkCodeMateriel()) {
        document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[0].style.borderColor = "black";
        document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[1].style.borderColor = "black";
        document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("div")[0].style.backgroundColor = "black";
        changeProgress(2);
    }
    else {
        document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[0].style.borderColor = "red";
        document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[1].style.borderColor = "red";
        document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("div")[0].style.backgroundColor = "red";
    }
}

function writeCodeMateriel() {
    for (var i = 0; i < types.length; i++) {
        if (types[i].toUpperCase().includes(inputTypeCodeMateriel.value.toUpperCase()) && inputTypeCodeMateriel.value != "") {
            inputTypeCodeMateriel.value = types[i];
            inputNumberCodeMateriel.focus();
        }
    }
}



var inputTypeCodeMateriel; 
var inputNumberCodeMateriel; 

var types = ["Canoé", "Kayak", "Planche à voile", "Voilier"];
function openPropositionsCodeMateriel() {

    document.getElementById("divTabCahierMaterielCodeEmbarcationTypeResults").innerHTML = "";

    inputTypeCodeMateriel.value = "";

    for (var i = 0; i < types.length; i++) {
        var divResult = document.createElement("div");
        divResult.classList.add("divTabCahierMaterielCodeEmbarcationTypeResult");
        document.getElementById("divTabCahierMaterielCodeEmbarcationTypeResults").appendChild(divResult);

        divResult.addEventListener("mousedown", function () {
            inputTypeCodeMateriel.value = this.getElementsByClassName("spanTabMaterielCodeEmbarcationType")[0].innerHTML;          
            actualizeCodeMateriel();
            closePropositionsCodeMateriel();
            inputNumberCodeMateriel.focus();//marche pas
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



function closePropositionsCodeMateriel() {
       document.getElementById("divTabCahierMaterielCodeEmbarcationTypeResults").innerHTML = "";
}


var categories = ["SUP", "Canoé", "Planche à voile", "Voilier","Kayak"];
function loadMateriel() {
    inputTypeCodeMateriel = document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[0];
    inputNumberCodeMateriel = document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[1];

    for (var i = 0; i < categories.length; i++) {
        var d = document.createElement("div");
        d.id = categories[i];
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

            changeTab(document.getElementById("divTabCahierMaterielElements"), 1);
            //document.getElementById("divTabCahierMateriel").style.marginTop = "-1000px";

            loadElements(this.id);
        });
    }
}