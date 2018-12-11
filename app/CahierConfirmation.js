function loadConfirmation() {

    var fields = ["Responsable-35px", "Heure de départ","Catégorie","Embarcation"];

    var first = div($('divTabCahierConfirmation'));
    first.id = "divTabCahierConfirmationFirstContainer";

        var container = div(first);
        container.id = "divTabCahierConfirmationContainer";

            container.innerHTML += '<div style=" font-size:25px; text-align:center; color:black;">Votre sortie</div>'
            container.innerHTML += '<div style="background-color:gray; height:2px; margin-bottom:15px;  margin-top:5px; border-radius:2px;"></div>'


            for (var i = 0; i < 3; i++) {
                var d = div(container);
                d.classList.add("divConfirmationTexts");
                div(div(d));
                div(d).innerHTML = fields[i];
                div(d);
            }
            
            container.innerHTML += '<div style="background-color:gray; height:2px; margin-bottom:15px; margin-top:10px; border-radius:2px;"></div>'

            var d = div(container);
            d.classList.add("divConfirmationTexts");
            d.style.backgroundColor = "lightgray";
            div(div(d));
            div(d).innerHTML = fields[3];
            div(d);

}







//<div id="divTabCahierConfirmationFirstContainer">

//    <div id="divTabCahierConfirmationContainer">

//        <div style=" font-size:25px; text-align:center; color:black;">Votre sortie</div>
//        <div style="background-color:gray; height:2px; margin-bottom:15px;  margin-top:5px; border-radius:2px;"></div>

//        <div class="divConfirmationTexts">
//            <div>   <div></div></div>               <div style="font-size:35px;">Responsable</div><div style="font-size:35px;">   </div>
//        </div>





//        <div class="divConfirmationTexts">
//            <div><div></div></div><div>Heure de départ</div><div></div>
//        </div>
//        <div class="divConfirmationTexts">
//            <div><div></div></div><div>Catégorie</div><div></div>
//        </div>




//        <div style="background-color:gray; height:2px; margin-bottom:15px; margin-top:10px; border-radius:2px; /*border-left:40px solid white;*/ "></div>

//        <div class="divConfirmationTexts" style="background-color:lightgray">
//            <div><div></div></div><div>Embarcation</div><div></div>
//        </div>




//        <div id="divTabCahierConfirmationEmbarcationBox">
//            <div><div></div></div><div id="divTabCahierConfirmationContainerTextsContainer"><div>asldkfj</div><div>asdfasdf</div></div>
//            <div class="ReturnButtons Buttons" onclick="popBookable(Cahier.bookableId)">Infos</div>  <div class="ReturnButtons Buttons" onclick="newTab('divTabCahierMaterielCategories')">Modifier</div>
//        </div>

//        <div style="background-color:gray; height:2px; margin-bottom:15px; margin-top:10px; border-radius:2px; /*border-left:40px solid white;*/  "></div><!--<div style="height:50px; background-color:red;"></div>-->

//                    <div class="divConfirmationTexts">
//            <div><div></div></div><div>Nbr d'acc.</div><div></div>
//        </div>
//        <div class="divConfirmationTexts">
//            <div><div></div></div><div>Destination</div><div></div>
//        </div>
//        <div class="divConfirmationTexts">
//            <div><div></div></div><div>Commentaire</div><div></div>
//        </div>

//        <div id="divTabCahierConfirmationInfosBox">
//            <div class="ReturnButtons Buttons" onclick="newTab('divTabCahierInfos')">Modifier</div><br />
//        </div>



//    </div>
//</div>