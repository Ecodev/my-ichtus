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

    var text = document.getElementById("inputTabCahierSearch").value.toUpperCase();

    if (e.keyCode == 13) {
        if (typeof document.getElementsByClassName("spanTabCahierSurname")[0] != "undefined") {
            var name = document.getElementsByClassName("spanTabCahierName")[0].innerHTML;
            var surname = document.getElementsByClassName("spanTabCahierSurname")[0].innerHTML;
            chosePerson(name, surname);
        }
    }
    
    document.getElementById("divTabCahierSearchResult").innerHTML = "";

    if (text != "") {

        var textParts = text.split(" ");

        var totalDivs = 5;

        var c = 0;

        for (var i = 0; i < People.length; i++) {

            var accept = false;

            if (c < totalDivs) {
                if (textParts.length == 1) { //no spaces
                    if ((People[i].name + " " + People[i].surname).toUpperCase().indexOf(text) != -1) {
                        accept = true;
                    }
                }
                else if ((People[i].name.toUpperCase().indexOf(textParts[0]) != -1 && People[i].surname.toUpperCase().indexOf(textParts[1]) != -1) || (People[i].name.toUpperCase().indexOf(textParts[1]) != -1 && People[i].surname.toUpperCase().indexOf(textParts[0]) != -1)) {
                    accept = true;
                }

                if (accept == true) {

                    var divResult = document.createElement("div");
                    divResult.classList.add("divTabCahierResultEntry");
                    document.getElementById("divTabCahierSearchResult").appendChild(divResult);

                    divResult.addEventListener("mousedown", function () { chosePerson(this.getElementsByClassName("spanTabCahierName")[0].innerHTML, this.getElementsByClassName("spanTabCahierSurname")[0].innerHTML); });

                    var span1 = document.createElement("span");
                    span1.classList.add("spanTabCahierName");
                    span1.innerHTML = People[i].name;
                    divResult.appendChild(span1);

                    var span2 = document.createElement("span");
                    span2.classList.add("spanTabCahierSurname");
                    span2.innerHTML = People[i].surname;
                    divResult.appendChild(span2);

                    if (c == 0) {
                        var img = document.createElement("img");
                        img.id = "imgTabCahierSearchIconEnter";
                        img.src = "Img/IconEnter.png";
                        divResult.appendChild(img);
                    }

                    if (People[i].gender == "M") {
                        divResult.style.backgroundImage = "url('Img/IconMan.png')";
                    }
                    else {
                        divResult.style.backgroundImage = "url('Img/IconWoman.png')";
                    }
                    c++;
                }

            }
            else {
                break; //déjà c divs rempli
            }
        }
        if (c == 0) {
            var divResult = document.createElement("div");
            divResult.classList.add("divTabCahierResultEntry");
            document.getElementById("divTabCahierSearchResult").appendChild(divResult);

            var span1 = document.createElement("span");
            span1.classList.add("spanTabCahierName");
            span1.innerHTML = "Aucun résultat :(";
            divResult.appendChild(span1);

            divResult.style.backgroundImage = "url('Img/IconNoResult.png')";
        }      
    }
}


function chosePerson(name, surname) {
    changeProgress(1);
    document.getElementById("divTabCahierInfosName").innerHTML = name + " " + surname;
    document.getElementById("divTabCahierInfosNbrInvites").getElementsByTagName("input")[0].focus();
}








