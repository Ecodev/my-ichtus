function loadConfirmation(elem = $('divTabCahierConfirmation')) {

    var fields = ["Responsable", "Heure de départ", "Catégorie", "Embarcation", "Nbr d'acc.", "Destination", "Commentaire dép.", "Commentaire arr."];

    var container;
    container = div(elem);
    container.style.position = "absolute";
    container.style.top = "50%";
    container.style.marginLeft = "0px";
    container.style.left = "50%";
    container.style.transform = "translate(-50%,-50%)";

    container.className = "divTabCahierConfirmationContainer";
 
    container.innerHTML += '<div style=" font-size:25px; text-align:center; color:black;">Votre sortie</div>';
    container.innerHTML += '<div style="background-color:gray; height:2px; margin-bottom:15px;  margin-top:5px; border-radius:2px;"></div>';

    for (var i = 0; i < 3; i++) {
        var d = div(container);
        d.classList.add("divConfirmationTexts");
        div(div(d));
        div(d).innerHTML = fields[i];
        div(d);
        if (i == 1 && elem != "tab") {
            d = div(container);
            d.classList.add("divConfirmationTexts");
            div(div(d));
            div(d).innerHTML = "Heure d'arrivée";
            div(d);
        }
    }
        
    grayBar(container);

    d = div(container);
    d.classList.add("divConfirmationTexts");
    d.style.backgroundColor = "lightgray";
    div(div(d));
    div(d).innerHTML = fields[3];
    div(d);

    var emb = div(container);
    emb.className = "divTabCahierConfirmationEmbarcationBox";
    div(div(emb));

        var texts = div(emb);
        texts.className = "divTabCahierConfirmationContainerTextsContainer";
        div(texts).innerHTML = "TITLE";
        div(texts).innerHTML = "n2";
    
        var btnInfos = div(emb);
        btnInfos.className = "ReturnButtons Buttons";
        btnInfos.innerHTML = "Infos";
     
    grayBar(container);


    for (var i = 4; i < 7; i++) {
        d = div(container);
        d.classList.add("divConfirmationTexts");
        div(div(d));
        div(d).innerHTML = fields[i];
        div(d);
    }


    d = div(container);
    d.classList.add("divConfirmationTexts");
    div(div(d));
    div(d).innerHTML = fields[7];
    div(d);

    var close = div(container);
    close.id = "divPopUpClose";
    close.onclick = function () {
        closePopUp({ target: elem },elem);
    };




}




function grayBar(elem) {
    var d = div(elem);
    d.style.backgroundColor = "gray";
    d.style.height = "2px";
    d.style.marginBottom = "15px";
    d.style.marginTop = "10px";
    d.borderRadius = "2px";

   // '<div style="background-color:gray; height:2px; margin-bottom:15px; margin-top:10px; border-radius:2px;"></div>';
}
