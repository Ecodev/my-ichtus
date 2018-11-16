//ProgressBar
function createProgressBar() {

    var Texts = ["Nom", "Embarcation", "Infos", "Confirmation"];

    for (var i = 0; i < 4; i++) {

        var divStep = document.createElement("div");
        divStep.classList.add("divTabCahierProgressStep");
        divStep.style.left = (6 + 26 * i) + "%";
        divStep.addEventListener("click", function () {
            var c = (parseInt(this.style.left) - 6) / 26;
            if (c < currentProgress) {
                changeProgress(c)
            }
           
        });
        document.getElementById("divTabCahierProgress").appendChild(divStep);

        divStep.classList.add("divTabCahierProgressStepCompleted");

        var divCircle = document.createElement("div");
        divCircle.classList.add("divTabCahierProgressCircle");
        divStep.appendChild(divCircle);

        var divNumber = document.createElement("div");
        divNumber.classList.add("divTabCahierProgressNumber");
        divNumber.innerHTML = (i + 1);
        divStep.appendChild(divNumber);

        var divText = document.createElement("div");
        divText.classList.add("divTabCahierProgressText");
        divText.innerHTML = Texts[i];
        divStep.appendChild(divText);
    }

    var divBar = document.createElement("divBar");
    divBar.id = "divTabCahierProgressBar";
    divBar.style.left = (11 + 26 * 0) + "%";
    document.getElementById("divTabCahierProgress").appendChild(divBar);

    var divBarBlue = document.createElement("divBar");
    divBarBlue.id = "divTabCahierProgressBarBlue";
    divBarBlue.style.left = (11 + 26 * 0) + "%";
    document.getElementById("divTabCahierProgress").appendChild(divBarBlue);

}

var currentProgress = 0;
function changeProgress(c) {

    var sign;
    if (c == currentProgress) {
        alert("c == currentProgress !!");
    }
    else {
        sign = Math.abs(c - currentProgress) / (c - currentProgress);
    }

    //alert(c + " current: " + currentProgress);
     

    currentProgress = c;
    for (var i = 0; i < 4; i++) {
        document.getElementsByClassName("divTabCahierProgressStep")[i].className = "divTabCahierProgressStep";
        if (i < c) {
            document.getElementsByClassName("divTabCahierProgressStep")[i].classList.add("divTabCahierProgressStepCompleted");
        }
        else if (i == c) {
            document.getElementsByClassName("divTabCahierProgressStep")[i].classList.add("divTabCahierProgressStepCurrent");
        }
        else {
            document.getElementsByClassName("divTabCahierProgressStep")[i].classList.add("divTabCahierProgressStepIncompleted");
        }
    }
    if (c == 0) {
        changeTab(document.getElementById("divTabCahier"), sign);
        document.documentElement.scrollTop = 0; //scroll up
    }
    if (c == 1) {
        changeTab(document.getElementById("divTabCahierMateriel"), sign);
        setTimeout(function () {

          //  document.getElementById("divTabCahierMaterielCodeEmbarcation").getElementsByTagName("input")[0].focus();
        }, changeTime);
        
    }
    if (c == 2) {
        changeTab(document.getElementById("divTabCahierInfos"), sign);
    } 
    if (c == 3) {
        changeTab(document.getElementById("divTabCahierConfirmation"), sign);
    } 

    window.location = "#Cahier" + c;
    document.getElementById("divTabCahierProgressBarBlue").style.width = (c * 26) + "%";
}