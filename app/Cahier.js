//PROBLèEME AVECS LES ACCENTS

var People = [];
People.push(new Person("Michel", "Lamato", "M"));
People.push(new Person("Mike", "Lamato", "M"));
People.push(new Person("Julie", "Jackson", "W"));
People.push(new Person("Marine", "Hules", "W"));
People.push(new Person("Pierre", "Thomas", "M"));
People.push(new Person("Aurélien", "Tam", "M"));
People.push(new Person("Aurélien", "Tam", "M"));
People.push(new Person("Aurélien", "Tam", "M"));
People.push(new Person("Aurélien", "Tam", "M"));

function Person(name, surname, gender) {
    this.name = name;
    this.surname = surname;
    this.gender = gender;
}



function Search(e) {

    var text = $("inputTabCahierSearch").value.toUpperCase();

    if (e.keyCode == 13) {
        if (typeof document.getElementsByClassName("spanTabCahierSurname")[0] != "undefined") {
            var name = document.getElementsByClassName("spanTabCahierName")[0].innerHTML;
            var surname = document.getElementsByClassName("spanTabCahierSurname")[0].innerHTML;
            chosePerson(name, surname);
        }
    }
   
    if (text != "") {
        Requests.getUsersList(text, 5);
    }
    else {
        $("divTabCahierSearchResult").innerHTML = "";
    }
}
function createSearchEntries(PeopleCorresponding) {
    console.log("createSearchEntries(): ", PeopleCorresponding);

    $("divTabCahierSearchResult").innerHTML = "";

    var c = 0;

    if (PeopleCorresponding.length == 0) {
        var divResult = document.createElement("div");
        divResult.classList.add("divTabCahierResultEntry");
        $("divTabCahierSearchResult").appendChild(divResult);

        var span1 = document.createElement("span");
        span1.classList.add("spanTabCahierName");
        span1.innerHTML = "Aucun résultat :(";
        divResult.appendChild(span1);

        divResult.style.backgroundImage = "url('Img/IconNoResult.png')";
    }
    else {

        for (var i = 0; i < PeopleCorresponding.length; i++) {
            var divResult = document.createElement("div");
            divResult.classList.add("divTabCahierResultEntry");
            $("divTabCahierSearchResult").appendChild(divResult);

            divResult.addEventListener("mousedown", function () { chosePerson(this.getElementsByClassName("spanTabCahierName")[0].innerHTML, this.getElementsByClassName("spanTabCahierSurname")[0].innerHTML); });

            var span1 = document.createElement("span");
            span1.classList.add("spanTabCahierName");
            span1.innerHTML = PeopleCorresponding[i].name;
            divResult.appendChild(span1);

            var span2 = document.createElement("span");
            span2.classList.add("spanTabCahierSurname");
            span2.innerHTML = PeopleCorresponding[i].id;
            divResult.appendChild(span2);

            if (i == 0) {
                var img = document.createElement("img");
                img.id = "imgTabCahierSearchIconEnter";
                img.src = "Img/IconEnter.png";
                divResult.appendChild(img);
            }

            if (PeopleCorresponding[i].name == "administrator") {
                divResult.style.backgroundImage = "url('Img/IconMan.png')";
            }
            else {
                divResult.style.backgroundImage = "url('Img/IconWoman.png')";
            }
        }
    }
}



function chosePerson(name, surname) {
    // changeProgress(1);
    Cahier.personName = name;
    Cahier.personSurname = surname;
    Cahier.personId = surname;
    newTab("divTabCahierMaterielCategories");
    $("divTabCahierInfosName").innerHTML = name + " " + surname;
}



function actualizeActualBookings(actualBookings) {

    for (var i = 0; i < actualBookings.length; i++) {
        var container = div($('divTabCahierTableActualBookings'));

        container.id = actualBookings[i].id;
        container.classList.add("TableEntries");
        container.classList.add("TableEntriesHover");

        container.addEventListener("click", function () { popBooking(this.id);});

        div(container).innerHTML = actualBookings[i].id;
        //div(container).innerHTML = actualBookings[i].responsible.name;
        div(container).innerHTML = "ACC:" +  actualBookings[i].participantCount;
        div(container).innerHTML = actualBookings[i].startComment.shorten(200,20);
        div(container).innerHTML = actualBookings[i].startDate;
        div(container).innerHTML = actualBookings[i].startComment.shorten(200, 20);
    }


}





function popBooking(bookingId) {

    Requests.getBookingInfos(bookingId);

    openPopUp();

    var pop = div($('divModal'));
    pop.id = "divTabCahierPopUp";
    pop.classList.add("Boxes");

    var close = div(pop);
    close.onclick = function () {
        closePopUp({ target: $('divModal') });
    };





    //var imgContainer = div(pop);

    //var descriptionTitle = div(pop);
    //descriptionTitle.innerHTML = "Description";

    //var description = div(pop);


    //var btn = div(pop);
    //btn.classList.add("Buttons"); btn.classList.add("ValidateButtons");
    //btn.innerHTML = "Choisir";
    //btn.addEventListener("click", function () {
    //    Cahier.bookableId = currentBookables[this.parentElement.getElementsByTagName("div")[1].id].id;
    //    Cahier.bookableName = currentBookables[this.parentElement.getElementsByTagName("div")[1].id].name;
    //    closePopUp({ target: $('divModal') });
    //    newTab("divTabCahierInfos");
    //});
    


    //var btn2 = div(pop);
    //btn2.classList.add("Buttons"); btn2.classList.add("ReturnButtons");
    ////  btn2.innerHTML = "Historique";

    //var textsContainer = div(pop);
    //textsContainer.id = "divTabCahierMaterielElementsContainerTextsContainer";

    //div(textsContainer);
    //div(textsContainer);
    //div(textsContainer);
    //div(textsContainer);
    //div(textsContainer);
}



function actualizePopBooking() { }