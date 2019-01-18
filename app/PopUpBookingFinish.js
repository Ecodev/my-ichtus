function openFinishBooking(elem,bookingId) {

    Requests.getBookingFinishInfos(bookingId,elem);

    var fields = ["Responsable", "Heure d'arrivée", "Embarcation", "Commentaire d'arrivée"];
    var images = ["IconResponsible", "IconEnd", "IconSail", "IconEndComment"];


    var container;
    container = div(elem);
    container.style.position = "absolute";
    container.style.top = "50%";
    container.style.marginLeft = "0px";
    container.style.left = "50%";
    container.style.transform = "translate(-50%,-50%)";

    container.className = "divTabCahierConfirmationContainer";

    container.innerHTML += '<div style=" font-size:25px; text-align:center; color:black;">Terminer votre sortie</div>';
    grayBar(container, 5);

    var d = div(container);
    d.classList.add("divConfirmationTexts");
    div(div(d)).style.backgroundImage = "url(Img/" + images[0] + ".png)";
    div(d).innerHTML = fields[0];
    div(d);

    d = div(container);
    d.classList.add("divConfirmationTexts");
    div(div(d)).style.backgroundImage = "url(Img/" + images[1] + ".png)";
    div(d).innerHTML = fields[1];
    div(d);

    grayBar(container);

    d = div(container);
    d.classList.add("divConfirmationTexts");
    div(div(d)).style.backgroundImage = "url(Img/" + images[2] + ".png)";
    div(d).innerHTML = fields[2];
    div(d);

    var emb = div(container);
    emb.className = "divTabCahierConfirmationEmbarcationBox";
    div(div(emb));

    var texts = div(emb);
    texts.className = "divTabCahierConfirmationContainerTextsContainer";
    texts.style.width = "210px";
    div(texts).innerHTML = "TITLE";
    div(texts).innerHTML = "n2";

    var radioContainer = div(emb);
    radioContainer.className = "radioContainer";

    var r1 = div(radioContainer);
    r1.classList.add("radioSelected");
    r1.onclick = function () { this.classList.add("radioSelected"); r2.classList.remove("radioSelected"); area.disabled = true; area.style.backgroundColor = "lightgray"; areaContainer.style.opacity = 0.5;}; //this.parentElement.parentElement.getElementsByTagName("textarea")[0].style.opacity = 0; 
    div(div(r1)); div(r1).innerHTML = "En bon état";
    var r2 = div(radioContainer);
    r2.onclick = function () { this.classList.add("radioSelected"); r1.classList.remove("radioSelected"); area.disabled = false; area.style.backgroundColor = "white"; areaContainer.style.opacity = 1;};//area.style.opacity = 1;}; 
    div(div(r2)); div(r2).innerHTML = "Endommagé";

    var areaContainer = div(emb);
    areaContainer.style.width = "0px";
    areaContainer.style.height = "0px";
    areaContainer.style.opacity = 0.5;
    var area = document.createElement("textarea");
    area.placeholder = "État de l'embarcation...";
    area.spellcheck = false;
    area.style.left = "350px";
    area.style.top = "30px";
    area.style.height = "95px";
    area.style.width = "290px";
    area.style.backgroundPositionX = "245px";
    area.disabled = "true"; area.style.backgroundColor = "lightgray";
    areaContainer.appendChild(area);
    area.focus();

    grayBar(container);

    d = div(container);
    d.classList.add("divConfirmationTexts");
    d.style.backgroundColor = "rgb(235,235,235)";
    div(div(d)).style.backgroundImage = "url(Img/" + images[3] + ".png)";
    div(d).innerHTML = fields[3];
    var area2 = document.createElement("textarea");
    area2.spellcheck = false;
    area2.placeholder = "Comment ça s'est passé...";
    div(d).appendChild(area2);
  
 
    var btnFinish = div(container);
    btnFinish.id = bookingId;
    btnFinish.classList.add("Buttons");
    btnFinish.classList.add("ValidateButtons");
    btnFinish.style.backgroundColor = "red";
    btnFinish.innerHTML = "Terminer";
    btnFinish.addEventListener("click", function () {
        var txt = "";
        if (area.parentElement.style.opacity == 1) {
            txt += "! " + area.value + " ! ";
        }
        txt += area2.value;
        Requests.terminateBooking(this.id, txt);
        closePopUp({ target: elem }, elem);
    });
   


    var close = div(container);
    close.className = "divPopUpClose";
    close.onclick = function () {
        closePopUp({ target: elem }, elem);
    };

}
function actualizePopBookingFinish(booking, elem) {
    elem.getElementsByClassName('divConfirmationTexts')[0].children[2].innerHTML = getResponsibleNameFromBooking(booking, true, { length: 1000000, fontSize: 35 });
    elem.getElementsByClassName('divConfirmationTexts')[1].children[2].innerHTML = date.getNiceTime();
   
    if (booking.bookables.length != 0) {
        elem.getElementsByClassName("divTabCahierConfirmationContainerTextsContainer")[0].getElementsByTagName("div")[0].innerHTML = booking.bookables[0].name.shorten(210, 25);
        elem.getElementsByClassName("divTabCahierConfirmationContainerTextsContainer")[0].getElementsByTagName("div")[1].innerHTML = booking.bookables[0].code;
        elem.getElementsByClassName("divTabCahierConfirmationEmbarcationBox")[0].getElementsByTagName("div")[0].addEventListener("click", function () { popBookable(booking.bookables[0].id); });
    }
    else {
        elem.getElementsByClassName("divTabCahierConfirmationContainerTextsContainer")[0].getElementsByTagName("div")[0].innerHTML = "Matériel personel";
        elem.getElementsByClassName("divTabCahierConfirmationContainerTextsContainer")[0].getElementsByTagName("div")[1].innerHTML = "";
        elem.getElementsByClassName("divTabCahierConfirmationEmbarcationBox")[0].getElementsByTagName("div")[0].style.visibility = "hidden";
    }
}

