
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
function actualizePopBookable(bookable, elem) {

	elem.getElementsByClassName('divTabCahierMaterielElementsPopUp')[0].getElementsByTagName("div")[3].innerHTML = bookable[0].description;
	elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[0].innerHTML = bookable[0].name.shorten(420, 30);
	elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[1].innerHTML = bookable[0].type.name + " / " + bookable[0].id;
	elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[2].innerHTML = "CODE: " + bookable[0].code;
	elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[3].innerHTML = "date: " + bookable[0].creationDate;

	elem.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[1].id = bookable[0].id;

	elem.getElementsByClassName('Buttons')[0].addEventListener("click", function () {
		popBookableHistory(this.parentElement.getElementsByClassName('divTabCahierMaterielElementsContainerTextsContainer')[0].getElementsByTagName("div")[1].id);
	});
}