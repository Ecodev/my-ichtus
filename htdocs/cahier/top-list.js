function actualizeBookableList() {
    let bookables = Cahier.bookings[0].bookables;

    $('divTabCahierTopList').children[0].innerHTML = '';
    $('divTabCahierTopList').children[0].style.opacity = '1';
    $('divTabCahierTopList').style.visibility = 'visible';

    document
        .getElementsByClassName('divTabCahierEquipmentChoiceContainer')[0]
        .children[3].children[0].classList.remove('buttonNonActive');

    for (let i = 0; i < bookables.length; i++) {
        let d = div($('divTabCahierTopList').children[0]);
        d.id = i;

        if (Cahier.bookings[0].bookables[i].id != 0) {
            // mat�riel personnel
            d.onclick = function (event) {
                if (
                    event.target == this.children[0] ||
                    event.target == this.children[2] ||
                    event.target == this.children[3]
                ) {
                    popBookable(Cahier.bookings[0].bookables[this.id].id);
                }
            };
        } else {
            document
                .getElementsByClassName('divTabCahierEquipmentChoiceContainer')[0]
                .children[3].children[0].classList.add('buttonNonActive');
            d.classList.add('PersonalSail');
        }

        let img = div(d);
        img.style.backgroundImage = Cahier.getImageUrl(Cahier.bookings[0].bookables[i]);

        let close = div(d);
        close.id = i;
        close.onclick = function () {
            Cahier.removeBookable(0, Cahier.bookings[0].bookables[this.id]);
        };

        let code = div(d);

        if (bookables[i].code != null) {
            if (bookables[i].code.length > 4) {
                code.style.fontSize = '12px';
            }
            code.innerHTML = bookables[i].code;
        } else {
            code.innerHTML = '';
        }

        if (bookables[i].available == false) {
            let alert = div(d);
            //  code.style.color = "red";
        }
    }

    if (bookables.length == 0) {
        $('divTabCahierTopList').children[0].style.opacity = '0';
        $('divTabCahierTopList').style.visibility = 'hidden';

        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].ListBar == true) {
                $(tabs[i].id).classList.remove('listBarActive');
            }
        }
        $('btnNext').classList.remove('activated');
    } else {
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].ListBar == true) {
                $(tabs[i].id).classList.add('listBarActive');
            }
        }
        $('btnNext').classList.add('activated');
    }
}
