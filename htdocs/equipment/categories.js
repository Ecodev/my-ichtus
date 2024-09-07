let categories = [
    {name: 'Canoë & Kayak', plural: 'canoës et kayaks', value: 'Kayak', image: 'canoe.png'},
    {name: 'SUP', plural: 'SUPs', value: 'SUP', image: 'sup.png'},
    {name: 'Rame', plural: 'avirons', value: 'Aviron', image: 'rowing.png'},
    {name: 'Planche à voile', plural: 'planches à voile', value: 'Planche', image: 'windsurf.png'},
    {name: 'Voile', plural: 'bateaux', value: 'Voile lestée', image: 'sailing.png'},
    {name: 'Wingfoil', plural: 'wingfoils', value: 'Wingfoil', image: 'wingfoil.svg'},
];

function loadMateriel(container = $('divTabCahierEquipmentCategoriesContainer')) {
    for (let i = 0; i < categories.length; i++) {
        let d = document.createElement('div');
        d.id = categories[i].name;
        d.classList.add('BoxesContainer');
        container.appendChild(d);

        let d1 = div(d);
        d1.id = i;
        d1.classList.add('Boxes');

        let dTop = div(d1);
        dTop.classList.add('BoxesTop');
        dTop.style.backgroundImage = 'url(img/icons/chose.png),' + 'url(img/categorie/' + categories[i].image + ')';

        let dBottom = document.createElement('div');
        dBottom.classList.add('BoxesBottom');
        d1.appendChild(dBottom);

        let dBottomText1 = document.createElement('div');
        dBottomText1.classList.add('BoxesBottomText1');
        dBottom.appendChild(dBottomText1);
        dBottomText1.innerHTML = categories[i].name;

        let dBottomText2 = document.createElement('div');
        dBottomText2.classList.add('BoxesBottomText2');
        dBottom.appendChild(dBottomText2);
        Requests.getBookableNbrForBookableTag(categories[i].value, dBottomText2, '', ' ' + categories[i].plural);

        if (categories[i].value == 'MP') {
            // useless
            d.addEventListener('click', function () {
                Cahier.bookableId = '';
                Cahier.bookableName = 'Matériel Personel';
                newTab('divTabCahierInfos');
            });
        } else {
            d.addEventListener('click', function () {
                newTab('divTabCahierEquipmentElements');
                $('divTabCahierEquipmentElementsSelectCategorie')
                    .getElementsByTagName('select')[0]
                    .getElementsByTagName('option')[parseInt(this.getElementsByTagName('div')[0].id) + 0].selected =
                    'selected';
                changeSelectCategorie(
                    $('divTabCahierEquipmentElementsSelectCategorie').getElementsByTagName('select')[0],
                );
            });
        }

        var opt = document.createElement('option');
        opt.innerHTML = categories[i].name;
        opt.value = categories[i].value;
        $('divTabCahierEquipmentElementsSelectCategorie').getElementsByTagName('select')[0].appendChild(opt);
    }

    var opt = document.createElement('option');
    opt.innerHTML = 'Toutes les catégories';
    opt.value = 'all';
    $('divTabCahierEquipmentElementsSelectCategorie').getElementsByTagName('select')[0].appendChild(opt);
}
