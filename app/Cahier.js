var textToolTipGuest = "Un non-membre doit toujours être accompagné par un membre d'Ichtus <br/> Il n'a donc pas le droit d'aller seul.";
var textToolTipUser = "Sortie pour les membres d'Ichtus<br/><br/>";


function actualizeActualBookings(actualBookings,first) {

    var all = $('divTabCahierTableActualBookings').getElementsByClassName("TableEntries");
    for (var i = 0; i < all.length; i++) {
        if (all[i].id != "divTabCahierTableActualBookingsTopBar") {
            all[i].parentNode.removeChild(all[i]);
            i--;
        }
    }

    if (actualBookings.length == 0) {
        var entry = div($('divTabCahierTableActualBookings'));

        entry.classList.add("TableEntries");
        entry.classList.add("TableEntriesHover");

        var cell = div(entry);
    }

    console.log("first", first);
    if (first == true) { // so new generated not just a search
        $('divTabCahierTableActualBookings').previousElementSibling.innerHTML = "Sorties en cours (" + actualBookings.length + ")";

        var children = $('divTabCahierTables').children;
        for (var i = 0; i < children.length; i++) {
            if (children[i].id != "divTabCahierTableActualBookings" && children[i].id != "inputTabCahierActualBookingsSearch" && children[i].id != "divTabCahierActualBookingsSearchTitle") {
                $('divTabCahierTables').removeChild(children[i]);
                i--;
            }           
        }
        newBookingTable(new Date(), "Sorties terminées");// tables sorties finies
    }

    for (var i = 0; i < actualBookings.length; i++) {

        var container = div($('divTabCahierTableActualBookings'));

        container.id = actualBookings[i].id;
        container.classList.add("TableEntries");
        container.classList.add("TableEntriesHover");

        container.addEventListener("click", function (event) {
            if (event.target.classList.contains("Buttons")) {
                openFinishBooking(openPopUp(),this.id);
            }
            else if (typeof event.target.getElementsByTagName("div")[0] != "undefined") {
                if (event.target.getElementsByTagName("div")[0].classList.contains("Buttons")) {
                     openFinishBooking(openPopUp(), this.id);
                }
                else {
                    popBooking(this.id);
                }
            }
            else {
                popBooking(this.id);
            }         
        });

        var divDate = div(container);    

        var maxHours = 24; 
        if (Date.now() - (new Date(actualBookings[i].startDate)).getTime() > maxHours/4 * 60 * 60 * 1000) {

            var d = div(divDate);
            d.classList.add('TableEntriesAlert');
            d.style.filter = "grayscale(1) invert(1)";

            if (Date.now() - (new Date(actualBookings[i].startDate)).getTime() > maxHours/2 * 60 * 60 * 1000) {
                d.style.filter = "none";
                d.style.filter = "grayscale(1)";
            }

            if (Date.now() - (new Date(actualBookings[i].startDate)).getTime() > maxHours * 60 * 60 * 1000) {
                d.style.filter = "none";
            }
        }
        

        divDate.id = "SORTING" + (new Date(actualBookings[i].startDate)).toISOString(); // for the sorting
        divDate.innerHTML += (new Date(actualBookings[i].startDate)).getNiceTime(":", true);


        div(container).innerHTML = actualBookings[i].participantCount;

        div(container).innerHTML = Cahier.getOwner(actualBookings[i],true);

        if (actualBookings[i].bookables.length == 0) {
            div(container).innerHTML = "Matériel Personel";
        }
        else {
            createBookingBookableBox(div(container), { code: actualBookings[i].bookables[0].code, name: actualBookings[i].bookables[0].name });
        }

        div(container).innerHTML = actualBookings[i].destination.shorten(150,20);

        div(container).innerHTML = getStartCommentFromBooking(actualBookings[i]).shorten(200, 20);

        var c = div(container);
        var btn = div(c);
        btn.classList.add("Buttons");
    }

    sortTable($('divTabCahierTableActualBookings'));
}

function createBookingBookableBox(elem, infos = { code: 9, name: "hello" }) {
    var d = elem;
    var cat = div(d);
    cat.id = "catégorie" + infos.code;
    var img = div(d);
    var code = div(d);
    code.innerHTML = infos.code;
    var name = div(d);
    name.innerHTML = infos.name;//.shorten(200, 18);
    d.classList.add("TableEntriesBookableBox");
}


function loadTableTopBars(allTables = document.getElementsByClassName("BookingsTable")) {

    for (var u = 0; u < allTables.length; u++) {

        var table = allTables[u];
        var top = table.getElementsByClassName("TableTopBar")[0];
        var all = top.getElementsByTagName("div");

        for (var i = 0; i < all.length; i = i + 2) {
            all[i].getElementsByTagName("div")[0].style.backgroundImage = "url(Img/IconSortASC.png)";

            if (!(all[i].parentElement.id == 'divTabCahierTableActualBookingsTopBar' && all[i].id == '6')) { // not sort finish buttons
            
                all[i].addEventListener("click", function () {

                    if (this.getElementsByTagName("div")[0].style.backgroundImage == 'url("Img/IconSortDESC.png")' || !(this.classList.contains("BookingsTopBarSorted"))) {
                        this.getElementsByTagName("div")[0].style.backgroundImage = "url(Img/IconSortASC.png)";
                        order = 1;
                    }
                    else {
                        this.getElementsByTagName("div")[0].style.backgroundImage = "url(Img/IconSortDESC.png)";
                        order = -1;

                    }

                    var allButtons = this.parentElement.getElementsByTagName("div");
                    for (var k = 0; k < all.length; k = k + 2) {
                        if (allButtons[k] != this) {
                            allButtons[k].classList.remove("BookingsTopBarSorted");
                            allButtons[k].getElementsByTagName("div")[0].style.backgroundImage = "url(Img/IconSortASC.png)";
                        }
                    }
                    this.classList.add("BookingsTopBarSorted");

                   sortTable(this.parentElement.parentElement);
                });

            }
        }  
    }
}

function sortTable(table) {

    var field = parseInt(table.getElementsByClassName("BookingsTopBarSorted")[0].id);
    var order = function () {
        if (table.getElementsByClassName("BookingsTopBarSorted")[0].getElementsByTagName("div")[0].style.backgroundImage == 'url("Img/IconSortDESC.png")') {
            return -1;
        }
        else {
            return 1;
        }
    };

  //  console.log("table.id: " + table.id, "field: " + field, "order: " + order());

    var all = table.getElementsByClassName("TableEntries");
    var switching = true;
    while (switching) {
        switching = false;
        for (var i = 1; i < all.length - 1; i++) {
            if (getSortingText(all[i].children[field]) > getSortingText(all[i + 1].children[field]) && order() == 1 || getSortingText(all[i].children[field]) < getSortingText(all[i + 1].children[field]) && order() == -1) {
                all[i].parentElement.insertBefore(all[i + 1], all[i]);
                switching = true;
            }
        }
    }
}

function getSortingText(elem) {
    if (elem.id.indexOf("SORTING") == 0) {
        return elem.id;
    }
    else {
        return elem.innerHTML.toUpperCase();
    }
}







function newBookingTable(date,title = "?") {
    if (title == "?"){title = date.getNiceDate();}
    Requests.getFinishedBookingListForDay(date, undefined,title,true);

    $('divTabCahierButtonMoreBookingsContainer').getElementsByTagName("div")[0].id = date.getPreviousDate();
    $('divTabCahierButtonMoreBookingsContainer').getElementsByTagName("div")[0].innerHTML = "Charger les sorties du " + date.getPreviousDate().getNiceDate(true);
}



function createBookingsTable(date,title) {

    var input = document.createElement("input");
    input.type = "text";
    input.value = "";
    input.spellcheck = "false";
    input.placeholder = "Rechercher";
    input.onkeyup = function () { Requests.getFinishedBookingListForDay(date, table, false); };
    $('divTabCahierTables').appendChild(input);

    var t = div($('divTabCahierTables'));
    t.classList.add("BookingsTableText");
    if (title == "?") {
        title = date.getNiceDate();
    }
    t.innerHTML = title;

    var table = div($('divTabCahierTables'));
    table.id = date.toISOString();
    table.classList.add("BookingsTable");

    var topBar = div(table);
    topBar.classList.add("TableEntries");
    topBar.classList.add("TableTopBar");

    var fields = ["", "", "", "Responsable", "Embarcation", "Destination", "Commentaire de départ", "Commentaire d'arrivée"];
    var images = ["IconStart", "IconEnd","IconParticipantCount","IconResponsible","IconSail", "IconDestination", "IconStartComment", "IconEndComment"];

    for (var i = 0; i < fields.length; i++) {
        var d = div(topBar);
        d.id = i;
        div(d); 
        var img = document.createElement("img");
        img.src = "Img/" + images[i] + ".png";
        img.alt = "?";
       // img.style.width = "25px";
       // img.style.marginRight = "5px";
        d.appendChild(img);
        d.innerHTML += fields[i];
    }

    topBar.getElementsByTagName("div")[0].classList.add("BookingsTopBarSorted");

    var b = div(table);
    b.style.position = "absolute";
    b.style.width = "100%";
    b.style.height = "2px";
    b.style.backgroundColor = "gray";
    b.style.zIndex = "2";


    loadTableTopBars([table]);

    return table;
}

function createNoBookingMessage(date) {
    var t = div($('divTabCahierTables'));
    t.classList.add("BookingsTableTextNoBooking");    
    t.innerHTML = "Aucune sortie le "+ date.getNiceDate();
}

function actualizeFinishedBookingListForDay(bookings,table) {


    var all = table.getElementsByClassName("TableEntries");
    for (var i = 0; i < all.length; i++) {
        if (all[i].classList.contains("TableTopBar") == false) {
            all[i].parentNode.removeChild(all[i]);
            i--;
        }
    }


    if (bookings.length == 0) {
        var entry = div(table);

        entry.classList.add("TableEntries");
        entry.classList.add("TableEntriesHover");

        var cell = div(entry);
    }
    else {
        for (var i = 0; i < bookings.length; i++) {

            var entry = div(table);

            entry.id = bookings[i].id;
            entry.classList.add("TableEntries");
            entry.classList.add("TableEntriesHover");

            entry.addEventListener("click", function (event) {
                    popBooking(this.id);
            });

            div(entry).innerHTML = (new Date(bookings[i].startDate)).getNiceTime(":", true);
            div(entry).innerHTML = (new Date(bookings[i].endDate)).getNiceTime(":", true);

            div(entry).innerHTML = bookings[i].participantCount;

            div(entry).innerHTML = Cahier.getOwner(bookings[i],true);

            if (bookings[i].bookables.length == 0) {
                div(entry).innerHTML = "Matériel Personel";
            }
            else {
                createBookingBookableBox(div(entry), { code: bookings[i].bookables[0].code, name: bookings[i].bookables[0].name });
            }

            div(entry).innerHTML = bookings[i].destination.shorten(150, 20);
            div(entry).innerHTML = getStartCommentFromBooking(bookings[i]).shorten(200, 20);; // "".shorten(200, 200);//getStartCommentFromBooking(bookings[i]);//.startComment.shorten(200, 20); // BIZARRRRERELRKJASéDL KFJASéDLF JKAéSLDKFJ 
            div(entry).innerHTML = getEndCommentFromBooking(bookings[i]);//.endComment.shorten(200, 20);

        }

        sortTable(table);
    }
}




