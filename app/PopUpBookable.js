function popBookable(bookableId, i = -1) {

	// alert(bookableId);

	var modal = openPopUp();

	Requests.getBookableInfos(bookableId, modal);

	//var pop = div($('divModal'));
	var pop = div(modal);
	pop.classList.add("Boxes");
	pop.classList.add("divTabCahierMaterielElementsPopUp");


	var close = div(pop);
	close.className  = "divPopUpClose";
	close.onclick = function () {
		closePopUp({target:modal},modal);
	};

	var imgContainer = div(pop);
	imgContainer.id = i;

	var descriptionTitle = div(pop);
	descriptionTitle.innerHTML = "Description";

	var description = div(pop);

	var btn2 = div(pop);
	btn2.classList.add("Buttons"); btn2.classList.add("ReturnButtons");
	btn2.innerHTML = "Historique";

	if (i != -1) {
		var btn = div(pop);
		btn.classList.add("Buttons"); btn.classList.add("ValidateButtons");
		btn.innerHTML = "Choisir";
		btn.addEventListener("click", function () {
			Cahier.bookableId = currentBookables[this.parentElement.getElementsByTagName("div")[1].id].id;
			Cahier.bookableName = currentBookables[this.parentElement.getElementsByTagName("div")[1].id].name;
			closePopUp({ target: modal},modal);
			newTab("divTabCahierInfos");
		});
	}



	var textsContainer = div(pop);
	textsContainer.className = "divTabCahierMaterielElementsContainerTextsContainer";

	div(textsContainer);
	div(textsContainer);
	div(textsContainer);
	div(textsContainer);
	div(textsContainer);

}


// !! CHANGER PLUS DE $ QUE CLASSS
function actualizePopBookable(bookable,bookings, elem) {

	elem.getElementsByClassName('divTabCahierMaterielElementsPopUp')[0].getElementsByTagName("div")[3].innerHTML = bookable.description;
	elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[0].innerHTML = bookable.name.shorten(420, 30);
	elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[1].innerHTML = bookable.type + " / " + bookable.id;
    elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[2].innerHTML = bookable.code;


    if (bookings.items[0].responsible != null) {
        elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[3].innerHTML = "Dernière utilisation le " + (new Date(bookings.items[0].startDate)).getNiceDate() + " par " + bookings.items[0].responsible.name;
    }
    else {
        elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[3].innerHTML = "Dernière utilisation le " + (new Date(bookings.items[0].startDate)).getNiceDate() + " par un invité";
    }
 
    elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[4].innerHTML = bookings.length + " sorties";
    grayBar(elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0]);

	elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[1].id = bookable.id;

	elem.getElementsByClassName('Buttons')[0].addEventListener("click", function () {
		popBookableHistory(this.parentElement.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[1].id);
	});
}