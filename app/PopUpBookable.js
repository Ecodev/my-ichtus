function popBookable(bookableId, justPreview = true, nbr = 0) {

    console.log("OPEN OPEN OPEN");

	var modal = openPopUp();

	Requests.getBookableInfos(nbr, bookableId, modal);

	//var pop = div($('divModal'));
	var pop = div(modal);
	pop.classList.add("Boxes");
    pop.classList.add("divTabCahierMaterielElementsPopUp");

   // document.getElementsByClassName('divTabCahierMaterielChoiceInputCodeContainer')[0].getElementsByTagName('input')[0].blur();
  //  document.getElementsByClassName('divTabCahierMaterielChoiceInputCodeContainer')[0].getElementsByClassName('ValidateButtons')[0].blur();

	var close = div(pop);
	close.className  = "divPopUpClose";
	close.onclick = function () {
		closePopUp({target:modal},modal);
	};

	var imgContainer = div(pop);
	//imgContainer.id = i;

	var descriptionTitle = div(pop);
	descriptionTitle.innerHTML = "Description";

    div(pop); // description box

	var btn2 = div(pop);
    btn2.classList.add("Buttons"); btn2.classList.add("ReturnButtons");
    btn2.style.visibility = "hidden";
	btn2.innerHTML = "Historique";

	if (!justPreview) {
		var btn = div(pop);
		btn.classList.add("Buttons"); btn.classList.add("ValidateButtons");
        btn.innerHTML = "Choisir";
        btn.setAttribute('tabindex', '0');
        btn.focus();

        if (currentTabElement.id == "divTabCahierConfirmation") {
            btn.style.backgroundImage = "url(Img/IconValidated.png)";
        }

	}
  

	var textsContainer = div(pop);
	textsContainer.className = "divTabCahierMaterielElementsContainerTextsContainer";

	div(textsContainer);
	div(textsContainer);
	div(textsContainer);
	div(textsContainer);
	div(textsContainer);
}



var eventListenerFunction;
function actualizePopBookable(nbr, bookable,bookings, elem) {

    elem.getElementsByTagName("div")[2].style.backgroundImage = "url(Img/" + bookable.image.id + ".png)";
    elem.getElementsByClassName('divTabCahierMaterielElementsPopUp')[0].getElementsByTagName("div")[3].innerHTML = bookable.description;
    elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[0].innerHTML = bookable.code;
    elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[1].innerHTML = bookable.name.shorten(420, 20);

	//elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[2].innerHTML = bookable.bookingType + " - " + bookable.code;


    if (bookings.length != 0) {
        elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[2].innerHTML = "Dernière utilisation le " + (new Date(bookings.items[0].startDate)).getNiceDate() + "<br/> Par " + Cahier.getOwner(bookings.items[0], false);
        elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[3].innerHTML = bookings.length + " sortie(s)";
        elem.getElementsByClassName('Buttons')[0].style.visibility = "visible";
        elem.getElementsByClassName('Buttons')[0].addEventListener("click", function () {
            popBookableHistory(this.parentElement.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[1].id);
        });
    }
    else {
        elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[3].innerHTML = "Encore aucune sortie enregistrée";
        elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[4].innerHTML = "";
        elem.getElementsByClassName('Buttons')[0].style.visibility = "hidden";
    } 


    if (elem.getElementsByClassName("ValidateButtons").length == 1) { // if !justPreview

        var choseFunction = function () {

            Cahier.setBookable(nbr, bookable);
            closePopUp({ target: elem }, elem);
            //document.body.removeEventListener("keyup", eventListenerFunction);

            if (currentTabElement.id == "divTabCahierConfirmation") {
                 closePopUp("last");
            }
            else {
                newTab("divTabCahierInfos");
            }
        };

        elem.getElementsByClassName("ValidateButtons")[0].addEventListener("click", choseFunction);

        eventListenerFunction = function (event) {
            if (event.keyCode == 13 && elem.id == "divModal" + lastModals) { // so the highest modal open
              //  choseFunction();
           }
        };

      //  setTimeout(function () { document.body.addEventListener("keyup", eventListenerFunction); console.log("added event listener"); },4000);
      //  ("keyup", eventListenerFunction);
    }

    grayBar(elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0]);

	elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[1].id = bookable.id;


}

function a() {

    setTimeout(function () {
        document.getElementsByClassName('divTabCahierMaterielElementsPopUp')[0].getElementsByClassName('ValidateButtons')[0].focus();
    }, 2000);
}