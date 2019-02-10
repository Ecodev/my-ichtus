//<div id="divTabCahierFieldsContainer">

//    <div id="divTabCahierInfosNbrInvites" class="TabCahierFields">
//        *Nbr de participants
//                    <input autocomplete="off" type="number" min="1" max="20" spellcheck="false" placeholder="1" value="1" onkeyup="writeNbrInvites(this);" onfocusin="this.value =''; writeNbrInvites(this); focusInOrOut(this,true);" onfocusout="if (this.value == '') { this.value = '1'; writeNbrInvites(this);}focusInOrOut(this,false);" />
//        <div></div>
//        <div id="divTabCahierInfosNbrInvitesPropositions" class="PropositionsContainer">
//            <div> 1 </div><div> 2 </div><div> 3 </div><div> 4 </div><div> 5 </div><div> 8 </div><div> 10 </div>
//        </div>
//        <div style="margin-top:110px; position:absolute; text-align:center; width:100%; font-size:15px;">(Vous inclu / minimum 1)</div>


//    </div><div id="divTabCahierInfosDestination" class="TabCahierFields">
//        *Destination
//                    <input autocomplete="off" value="Baie" type="text" spellcheck="false" placeholder="Destination" onkeyup="writeDestination(this);" onfocusin="if (this.value == 'Baie') { this.value = '';}; focusInOrOut(this,true); writeDestination(this);" onfocusout="focusInOrOut(this,false); writeDestination(this);" /> <!--/> mmmmh ??-->
//                    <div></div>
//        <div id="divTabCahierInfosDestinationPropositions" class="PropositionsContainer">
//            <div>Baie</div><div>La Ramée</div><div>La Tène</div><div>Neuchâtel</div><div>Cudrefin</div>
//        </div>


//    </div><div id="divTabCahierInfosStartComment" class="TabCahierFields">
//        Commentaire de départ
//                    <textarea spellcheck="false" placeholder="Informations, numéro de téléphone, habillement..." value=""></textarea>
//        <div style="height:100px;"></div>
//    </div>

   
//            </div>

//    <div style="text-align:center; margin-left:2.5%">Les champs avec un * sont obligatoires !</div>

//    <br />

//    <div style="text-align:center;">
//        <div class="Buttons ValidateButtons" onclick="checkInfos();">Suivant</div>
//    </div>


function popCahierInfos(nbr) {

    var elem = openPopUp();

    var container;
    container = div(elem);

}