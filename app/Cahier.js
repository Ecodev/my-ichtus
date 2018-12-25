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


var enterSearchPosition = 0;
function Search(e) {

    var text = $("inputTabCahierSearch").value.toUpperCase();

    if (e.keyCode == 13) {
        var all = document.getElementsByClassName("divTabCahierResultEntry");
        for (var i = 0; i < all.length; i++) {
            if (typeof all[i].getElementsByTagName("img")[0] != "undefined") {
                var name = all[i].getElementsByClassName("spanTabCahierName")[0].innerHTML;
                var surname = all[i].getElementsByClassName("spanTabCahierSurname")[0].innerHTML;
                chosePerson(name, surname);
            }
        }
    }
    else if (e.keyCode == 40 || e.keyCode == 38) {

    }
    else if (text != "") {
        Requests.getUsersList(text, 5);
        enterSearchPosition = 0;
    }
    else {
        $("divTabCahierSearchResult").innerHTML = "";
    }
}


function SearchDown(e) {
    if (e.keyCode == 40 || e.keyCode == 38) {
        if (e.keyCode == 40) {
            enterSearchPosition++;
        }
        else {
            enterSearchPosition--;
        }
        if (lastPeople != undefined) {

            for (var i = 0; i < lastPeople.length; i++) {

                var elem = document.getElementsByClassName("divTabCahierResultEntry")[i];

                elem.style.backgroundColor = "";
                if (typeof elem.getElementsByTagName("img")[0] != "undefined") {
                    elem.removeChild(elem.getElementsByTagName("img")[0]);
                }
                if (i == (enterSearchPosition % lastPeople.length + lastPeople.length) % lastPeople.length) {
                    var img = document.createElement("img");
                    img.id = "imgTabCahierSearchIconEnter";
                    img.src = "Img/IconEnter.png";
                    elem.appendChild(img);

                    elem.style.backgroundColor = "darkgray";
                }
            }

            //createSearchEntries(lastPeople);
        }
        e.preventDefault();
    }
}


var lastPeople;
function createSearchEntries(PeopleCorresponding) {

    lastPeople = PeopleCorresponding;

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

                divResult.style.backgroundColor = "darkgray";
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



function actualizeActualBookings(actualBookings,actualBookingsBookable) {

        var container = div($('divTabCahierTableActualBookings'));

        container.id = actualBookings.id;
        container.classList.add("TableEntries");
        container.classList.add("TableEntriesHover");

        container.addEventListener("click", function () { popBooking(this.id);});

        div(container).innerHTML = actualBookings.id;
        div(container).innerHTML = actualBookingsBookable.code;
        div(container).innerHTML = actualBookings.responsible.name;
        div(container).innerHTML = actualBookings.startDate;

        div(container).innerHTML = actualBookingsBookable.code;
        div(container).innerHTML = actualBookingsBookable.name.shorten(250, 20);
        div(container).innerHTML = actualBookings.participantCount;
        div(container).innerHTML = actualBookings.destination.shorten(150,20);
        div(container).innerHTML = Cahier.getStartCommentText(actualBookings.startComment).shorten(200, 20);
}


function actualizeActualBookings2(actualBookings, actualBookingsBookable) {

    var all = document.getElementsByClassName("TableEntries");
    for (var i = 0; i < all.length; i++) {
        if (all[i].id != "divTabCahierTableActualBookingsTopBar") {
            all[i].parentNode.removeChild(all[i]);
            i--;
        }
    }

    console.log("aa", actualBookingsBookable);
    //$('divTabCahierTableActualBookings').innerHTML = "";
    //alert(actualBookings.length + " " + actualBookingsBookable.length);

    for (var i = 0; i < actualBookings.length; i++) {
        var container = div($('divTabCahierTableActualBookings'));

        container.id = actualBookings[i].id;
        container.classList.add("TableEntries");
        container.classList.add("TableEntriesHover");

        container.addEventListener("click", function (event) {
            if (event.target.classList.contains("Buttons")) {
                openFinishBooking(openPopUp(),this.id);
            }
            else if (typeof event.target.getElementsByTagName("div")[0] == "undefined") {
                popBooking(this.id);
            }
            else {
                openFinishBooking(openPopUp(),this.id);
            }         
        });

        div(container).innerHTML = actualBookings[i].id;
        div(container).innerHTML = actualBookingsBookable[i].code;
        div(container).innerHTML = actualBookings[i].responsible.name;
        var d = new Date(actualBookings[i].startDate);
        div(container).innerHTML = d.getNiceTime();

        div(container).innerHTML = actualBookingsBookable[i].code;
        div(container).innerHTML = actualBookingsBookable[i].name.shorten(250, 20);
        div(container).innerHTML = actualBookings[i].participantCount;
        div(container).innerHTML = actualBookings[i].destination.shorten(150, 20);
        div(container).innerHTML = Cahier.getStartCommentText(actualBookings[i].startComment).shorten(200, 20);

        var c = div(container);
        var btn = div(c);
        btn.classList.add("Buttons");
        c.addEventListener("click", function () {
           //openFinishBooking(openPopUp());
        });

    }
}












function sort(field = 0,order = 1) {
    var all = $('divTabCahierTableActualBookings').getElementsByClassName("TableEntries");
    var switching = true;
    while (switching) {
        switching = false;
        for (var i = 1; i < all.length-1; i++) {
            if (all[i].getElementsByTagName("div")[field].innerHTML.toLowerCase() > all[i + 1].getElementsByTagName("div")[field].innerHTML.toLowerCase() && order == 1 || all[i].getElementsByTagName("div")[field].innerHTML.toLowerCase() < all[i + 1].getElementsByTagName("div")[field].innerHTML.toLowerCase() && order == -1) {
                all[i].parentElement.insertBefore(all[i + 1], all[i]);
                switching = true;
            }
        }
    }
}




//function popBookingsList(bookableId) {

//    var modal = openPopUp();

//    Requests.getBookingsListForBookable(bookableId,modal);

//    var container;
//    container = div(modal);
//    container.classList.add("Boxes");
//    container.style.position = "absolute";
//    container.style.width = "700px";
//    container.style.minHeight = "100px"; 
//    container.style.maxHeight = "800px"; 
//    container.style.top = "50%";
//    container.style.marginLeft = "0px";
//    container.style.left = "50%";
//    container.style.transform = "translate(-50%,-50%)";
//    container.style.padding = "10px";

//    container.innerHTML += '<div style=" font-size:25px; text-align:center; color:black;">Historique</div>';
//    container.innerHTML += '<div style="background-color:gray; height:2px; margin-bottom:15px;  margin-top:5px; border-radius:2px;"></div>';

//    var close = div(container);
//    close.className = "divPopUpClose";
//    close.onclick = function () {
//        closePopUp({ target: modal }, modal);
//    };


//    var t = div(container);
//    t.className = "PopUpBookingsListTable";

//    var r = div(t);
//    r.classList.add("PopUpBookingsListRow");
//    r.classList.add("TableTopBar");

//    var c1 = div(r);
//    c1.classList.add("BookingsTopBarSorted");
//    c1.innerHTML = "kjk";
//    div(c1);

//    var c2 = div(r);
//    c2.innerHTML = "destination";
//    div(c2);



//    grayBar(container);

//    loadTableTopBars(r);


//}


//function actualizePopBookingsList(bookings, elem) {

//    var t = elem.getElementsByClassName("PopUpBookingsListTable")[0];

//    for(var i = 0; i < bookings.length; i++) {
//        var r = div(t);
//        r.id = bookings[i].id;
//        r.className = "PopUpBookingsListRow";
//        r.onclick = function () {
//            popBooking(this.id);
//        };

//        div(r).innerHTML = bookings[i].id;
//        div(r).innerHTML = bookings[i].destination;

//    }
//}








function loadTableTopBars(top = $('divTabCahierTableActualBookingsTopBar')) {

    var all = top.getElementsByTagName("div");

    for (var i = 0; i < all.length; i = i + 2) {
        all[i].getElementsByTagName("div")[0].style.backgroundImage = "url(Img/IconSortASC.png)";
        all[i].addEventListener("click", function () {

            if (this.getElementsByTagName("div")[0].style.backgroundImage == 'url("Img/IconSortDESC.png")' || !(this.classList.contains("BookingsTopBarSorted"))) {
                this.getElementsByTagName("div")[0].style.backgroundImage = "url(Img/IconSortASC.png)";
                order = 1;
            }
            else {
                this.getElementsByTagName("div")[0].style.backgroundImage = "url(Img/IconSortDESC.png)";
                order = -1;

            }

            // alert(this.getElementsByTagName("div")[0].style.backgroundImage);

            for (var i = 0; i < all.length; i = i + 2) {
                if (all[i] != this) {
                    all[i].classList.remove("BookingsTopBarSorted");
                    all[i].getElementsByTagName("div")[0].style.backgroundImage = "url(Img/IconSortASC.png)";
                }
            }
            this.classList.add("BookingsTopBarSorted");


            // FAUDRA FAIRE UN SORT GENERAL POUR N'IMPORTE QUEL TABLE
            if (top == $('divTabCahierTableActualBookingsTopBar')) {
                sort(parseInt(this.id), order);
            }

           
        });
    }
    
}