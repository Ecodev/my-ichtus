function actualizeBookableList() {

    var bookables = Cahier.bookings[0].bookables;

    $('divTabCahierTopList').children[0].innerHTML = "";
    $('divTabCahierTopList').children[0].style.visibility = "visible";

    for (var i = 0; i < bookables.length; i++) {
        var d = div($('divTabCahierTopList').children[0]);
        d.id = i;
        d.onclick = function (event) {
            if (event.target == this.children[0] || event.target == this.children[2]) {
                popBookable(Cahier.bookings[0].bookables[this.id].id);
            }
            console.log(event.target);
        };

        var img = div(d);
        //img.style.backgroundImage = ''

        var close = div(d);
        close.id = i;
        close.onclick = function () {
            Cahier.removeBookable(0, Cahier.bookings[0].bookables[this.id]);
        };

        var code = div(d);
        code.innerHTML = bookables[i].code;
    }

    if (bookables.length == 0) {

        $('divTabCahierTopList').children[0].style.visibility = "hidden";

        //var d = div($('divTabCahierTopList').children[0]);

        //d.onclick = function () { newTab('divTabCahierMaterielChoice'); };

        //var img = div(d);
        //img.style.backgroundImage = 'url(Img/IconEye.png)';
    }

}