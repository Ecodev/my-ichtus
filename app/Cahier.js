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
    console.log(PeopleCorresponding);

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

    //var container = div($('divTabCahierTableActualBookings'));

    //container.classList.add("TableEntries");
    //container.classList.add("TableEntriesHover");

    //var id = div(container);
    //id.innerHTML = "ID";

    //var id = div(container);
    //id.innerHTML = "rep";

    //var id = div(container);
    //id.innerHTML = "monsieru bonsoirsoi";

    //var id = div(container);
    //id.innerHTML = "d";

    //var id = div(container);
    //id.innerHTML = "lkj";

    for (var i = 0; i < actualBookings.length; i++) {
        var container = div($('divTabCahierTableActualBookings'));

        container.classList.add("TableEntries");
        container.classList.add("TableEntriesHover");

        var id = div(container);
        id.innerHTML = actualBookings[i].id;

        var id = div(container);
        id.innerHTML = actualBookings[i].startDate;

        var id = div(container);
        id.innerHTML = actualBookings[i].participantCount;

        var id = div(container);
        id.innerHTML = actualBookings[i].id;

 
    }


}







