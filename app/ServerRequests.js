var Server;
function ServerInitialize() {
    // Get the API
    Server = window.ichtusApi;
    console.warn('Server(API) = ', Server);

  //  Requests.getItemList();

   // getCountries();
 //  Requests.createQuery();
   // Requests.addBookable();

 //   Requests.personalQuery();$

   // Requests.addBookable("Planche 1", "une magnifique planche qui flotte dotée d'une dérive pour ne pas dériver");
}


var bookingsResult = [];

var Requests = {

    // login
    login: function (pwd) {
        alert("ok");
        Server.userService.login({
            login: 'bookingonly',
            password: pwd
        }).subscribe(result => {
            console.log(result);
            alert("logged");
        });
    },


    // getUsersList FOR CAHIER.JS
    getUsersList: function (text = "") {
        var filter = {
            filter: {
                groups: [
                    { conditions: [{ custom: { search: { value: '%' + text + '%' } } }] }
                ]
            },
            pagination: {
                pageSize: 5,
                pageIndex: 0
            },
            sorting: [{
                field: 'lastName', //lastName?
                order: 'ASC'
            },
            {   //if same family name sort by firstName
                field: 'firstName', //lastName?
                order: 'ASC'
            }]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.userService.getAll(variables).subscribe(result => {
            console.log("getUsersList(): ", result);
            createSearchEntries(result.items);
        });
    },

    // getBookablesList
    getBookablesList: function () {

        var order;
        if ($('divTabCahierMaterielElementsSelectIconSort').style.backgroundImage == 'url("Img/IconSortDESC.png")') {
            order = "DESC";
        }
        else {
            order = "ASC";
        }

        var lastUse = false;
        var nbrBookings = false;
        var whichField = $('divTabCahierMaterielElementsSelectSort').getElementsByTagName("select")[0].value;
        if (whichField == "lastUse") { whichField = "id"; lastUse = true; }
        if (whichField == "nbrBookings") { whichField = "id"; nbrBookings = true; }

        var txt = $('inputTabCahierMaterielElementsInputSearch').value;

        var categorie = $('divTabCahierMaterielElementsSelectCategorie').getElementsByTagName("select")[0].value;
        if (categorie == "all") { categorie = ""; }

        //alert(categorie);

        var f = {
            filter: {
                groups: [
                    {
                        groupLogic: 'AND',
                        conditionsLogic: 'AND',
                        conditions: [
                            {
                                custom: { // marche pas pour description
                                    search: {
                                        value: "%" + txt + "%"
                                    }
                                },
                                bookingType: {
                                    like: {
                                        value: "self_approved"
                                    }
                                }
                            }
                        ]
                    },
                    {       //CATEGORIES...
                        groupLogic: 'AND',
                        joins: {
                            bookableTags: {
                                //type:"innerJoin", marhce pas.... left/inner =?
                                conditions: [
                                    {
                                        name: {
                                            like: {
                                                value: "%" + categorie + "%"
                                            }
                                        }
                                    }
                                ]
                            }
                        }

                    }
                ]
            },
            sorting: [
                { field: whichField, order: order }
            ],
            pagination: {
                pageSize: parseInt($('divTabCahierMaterielElementsSelectPageSize').getElementsByTagName('select')[0].value),
                pageIndex: 0
            }
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', f);

        Server.bookableService.getAll(variables).subscribe(result => {
            console.log("getBookablesList(): ", result);

            if (!lastUse && !nbrBookings || result.items.length == 0) {
                loadElements(result.items);
            }
            else if (lastUse) {

                console.log("lastUse ! ");

                var bookings = [];
                bookings.fillArray(result.items.length,"1111-01-02T13:32:51+01:00");

                for (var i = 0; i < result.items.length; i++) {

                    var filter = {
                        filter: {
                            groups: [
                                { conditions: [{ bookables: { have: { values: [result.items[i].id] } } }] }
                            ]
                        },
                        pagination: {
                            pageSize: 1,
                            pageIndex: 0
                        },
                        sorting: [
                            {
                                field: "startDate",
                                order: "DESC" //get the latest booking !
                            }
                        ]
                    };

                    var counter = 0;

                    var variables = new Server.QueryVariablesManager();
                    variables.set('variables', filter);

                    Server.bookingService.getAll(variables).subscribe(r => {

                        console.log(r);

                        if (r.items.length != 0) {         // else : already a zero ? maybe change to start of the universe lol        
                            var bookableId = r.items[0].bookables[0].id;
                            console.log(bookableId);

                            var c = -1;
                            var firstArray = result.items;
                            for (var i = 0; i < firstArray.length; i++) {
                                if (firstArray[i].id == bookableId) {
                                    c = i;
                                    break;
                                }
                            }

                            bookings[c] = r.items[0].startDate;
                        }

                        counter++;

                        if (counter == result.items.length) {
                            result.items.sortBy(bookings, order);
                            loadElements(result.items);
                        }
                    });
                }
            }
            else if (nbrBookings) {
                console.log("nbrBookings ! ");

                var bookings = [];
                bookings.fillArray(result.items.length,0);

                for (var i = 0; i < result.items.length; i++) {

                    var filter = {
                        filter: {
                            groups: [
                                { conditions: [{ bookables: { have: { values: [result.items[i].id] } } }] }
                            ]
                        },
                        pagination: {
                            pageSize: 1 // just for identifying the id
                        },
                    };

                    var counter = 0;

                    var variables = new Server.QueryVariablesManager();
                    variables.set('variables', filter);

                    Server.bookingService.getAll(variables).subscribe(r => {

                        if (r.items.length == 0) {
                            console.log("no booking");
                        }
                        else {
                             // r.length != r.items.length           !!
                            var bookableId = r.items[0].bookables[0].id;
                            console.log(bookableId);

                            var c = -1;
                            var firstArray = result.items;
                            for (var i = 0; i < firstArray.length; i++) {
                                if (firstArray[i].id == bookableId) {
                                    c = i;
                                    break;
                                }
                            }

                            bookings[c] = r.length; // not items.length !             
                        }

                        counter++;

                        if (counter == result.items.length) {
                            result.items.sortBy(bookings, order);
                            loadElements(result.items);
                        }
                    });
                }
            }
            else {
                alert("mmmhh.");
            }

        });
    },



    getBookableNbrForBookableTag: function (bookableTag, elem, before = "", after = "") {

        var filter = {
            filter: {
                groups: [{
                    joins: {
                        bookableTags: {
                            conditions: [
                                {
                                    name: {
                                        like: {
                                            value: "%" + bookableTag + "%"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
                ]
            },
            pagination: {
                pageSize: 0,
                pageIndex: 0
            }
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter); 

        Server.bookableService.getAll(variables).subscribe(result => {
            var txt = before + result.length + after;    
            elem.innerHTML = txt;
        });
    },

    // getBookableInfos
    getBookableInfos: function (bookableId,elem) {




       


        var filter = {
            filter: {
                groups: [
                    { conditions: [{ id: { like: { value: bookableId } } }] }
                ]
            },
            pagination: {
                pageSize: 1,
                pageIndex: 0
            },
            sorting: [{
                field: "id", //USELESS
                order: "ASC" //USELESS
            }]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookableService.getAll(variables).subscribe(result => {
            console.log("getBookableInfos(): ", result);

            var filter = {
                filter: {
                    groups: [
                        {
                            joins: {
                                bookables: {
                                    conditions: [{
                                        id: {
                                            like: {
                                                value: bookableId
                                            }
                                        }
                                    }]
                                }
                            }
                        }
                    ]
                },
                pagination: {
                    pageSize: 1,
                    pageIndex: 0
                },
                sorting: [{
                    field: "startDate", //USELESS
                    order: "DESC" //USELESS
                }]
            };

            var variables = new Server.QueryVariablesManager();
            variables.set('variables', filter);

            Server.bookingService.getAll(variables).subscribe(bookings => {
                console.log("getBookableInfos()_getLastBooking: ", bookings);

                actualizePopBookable(result.items[0], bookings, elem);
            });
        });
    },


    // Add an item
    addBookable: function (_name, _description) {

        const item = { name: "1", description: "kj", bookingType: "self_approved", type: 6004 };

        Server.bookableService.create(item).subscribe(result => {
            console.log('Bookable created', result);
        });

    },

    // getActualBookingList()
    getActualBookingList: function (first = false) {

        var filter = {
            filter: {
                groups: [   
                    {
                        groupLogic:"AND",

                        conditions: [{
                                status: {
                                    equal: {
                                        value: "booked"
                                    }
                                },
                                custom: {
                                    search: {
                                        value: "%" + $('inputTabCahierActualBookingsSearch').value + "%"
                                    }
                                },
                                endDate: {
                                    null: {
                                        not: false
                                    }
                                },   
                                bookables: {
                                    empty: {
                                        not: true
                                    }
                                }
                                
                            }
                        ],
                        joins: {
                            bookables: {
                                type:"leftJoin",
                                conditions: [{
                                    bookingType: {
                                        equal: {
                                            value: "self_approved"
                                        }
                                    }
                                }]
                            }
                        }
                     
                    },
                    {
                        groupLogic: "OR",

                        conditions: [{
                            status: {
                                equal: {
                                    value: "booked"
                                }
                            },
                            custom: {
                                search: {
                                    value: "%" + $('inputTabCahierActualBookingsSearch').value + "%"
                                }
                            },
                            endDate: {
                                null: {
                                    not: false
                                }
                            },
                            bookables: {
                                empty: {
                                    not:false
                                }
                            }
                        }
                        ]
                    }

                    
                ]
            },
            pagination: {
                pageSize: 100,
                pageIndex: 0
            },
            sorting: [
                {
                    field: "id",
                    order: "ASC"
                }
            ]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(result => {
            console.log("getActualBookingList(): ", result);
            actualizeActualBookings(result.items,first);
        });

    },

    // getFinishedBookingListForDay()
    getFinishedBookingListForDay: function (d = new Date(),table = "?", title,first = false) {

        var start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        var end = new Date(d.getFullYear(), d.getMonth(), d.getDate()+1, 0, 0, 0, 0);

        var txt = "%";
        if (table != "?") {
            txt = "%" + table.previousElementSibling.previousElementSibling.value + "%";
        }

        var filter = {
            filter: {
                groups: [
                    {

                        groupLogic: "AND",

                        conditions: [{
                            status: {
                                equal: {
                                    value: "booked"
                                }
                            },
                            custom: {
                                search: {
                                    value: "%" + txt + "%"
                                }
                            },
                            endDate: {
                                null: {
                                    not: true
                                }
                            },
                            startDate: {
                                between: {
                                    from: start.toISOString(),
                                    to: end.toISOString()
                                }
                            },
                            bookables: {
                                empty: {
                                    not: true
                                }
                            }

                        }
                        ],
                        joins: {
                            bookables: {
                                type: "leftJoin",
                                conditions: [{
                                    bookingType: {
                                        equal: {
                                            value: "self_approved"
                                        }
                                    }
                                }]
                            }
                        }

                    },
                    {
                        groupLogic: "OR",

                        conditions: [{
                            status: {
                                equal: {
                                    value: "booked"
                                }
                            },
                            custom: {
                                search: {
                                    value: "%" + txt + "%"
                                }
                            },
                            endDate: {
                                null: {
                                    not: true
                                }
                            },
                            startDate: {
                                between: {
                                    from: start.toISOString(),
                                    to: end.toISOString()
                                }
                            },
                            bookables: {
                                empty: {
                                    not: false
                                }
                            }
                        }]
                    }    
                    ]
            }
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(result => {
            console.log("getFinishedBookingListForDay(): ", result);

            if (first == true) {
                if (result.length == 0) {
                    createNoBookingMessage(d);
                }
                else {
                    table = createBookingsTable(d, title + " (" + result.length+")");
                    actualizeFinishedBookingListForDay(result.items, table);
                }
            }
            else { // first == false
                 actualizeFinishedBookingListForDay(result.items, table); 
            }                   
        });
    },

    

    // getBookableHistory()
    getBookableHistory: function (bookableId, elem, lastDate, Size = 10) {

        console.log("getbookableHistory", bookableId, "lastDate:", lastDate, "Size",Size);

        var filter = {
            filter: {
                groups: [
                    {
                        joins: {
                            bookables: {
                                conditions: [{
                                    id: {
                                        like: {
                                            value: bookableId
                                        }
                                    }
                                }]
                            }
                        }
                    },
                    {
                        conditions: [{
                            startDate: {
                                less: {
                                    value: lastDate.toISOString()
                                }
                            }
                        }]
                    }
                ]
            },
            pagination: {
                pageSize: Size,
                pageIndex: 0
            },
            sorting: [{
                field: "startDate", 
                order: "DESC" 
            }]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(first => {
            console.log("getBookableHistory(): ", first);

            var bookings = first.items;

            if (first.items.length == 0) {
                if (elem.getElementsByClassName("Buttons").length == 1) {
                    elem.getElementsByClassName("Buttons")[0].parentElement.removeChild(elem.getElementsByClassName("Buttons")[0]);
                    elem.getElementsByTagName("br")[0].parentElement.removeChild(elem.getElementsByTagName("br")[0]);
                    var t = div(elem.getElementsByClassName("PopUpBookableHistoryContainerScroll")[0]);
                    t.innerHTML = 'Toutes les sorties ont été chargées ! <br/>';
                    t.style.textAlign = 'center';
                 }
            }
            else {
                var end = new Date(bookings[bookings.length - 1].startDate);
                var start = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 0, 0, 0, 1);
                end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), end.getHours(), end.getMinutes(), end.getSeconds() - 1, 0);

                var filter = {
                    filter: {
                        groups: [
                            {
                                joins: {
                                    bookables: {
                                        conditions: [{
                                            id: {
                                                equal: {
                                                    value: bookableId
                                                }
                                            }
                                        }]
                                    }
                                }
                            },
                            {
                                conditions: [{
                                    startDate: {
                                        between: {
                                            from: start.toISOString(),
                                            to: end.toISOString()
                                        }
                                    }
                                }]
                            }
                        ]
                    },
                    pagination: {
                        pageSize: 100,
                        pageIndex: 0 
                    },
                    sorting: [{
                        field: "startDate",
                        order: "DESC"
                    }]
                };

                var variables = new Server.QueryVariablesManager();
                variables.set('variables', filter);

                Server.bookingService.getAll(variables).subscribe(addition => {
                    console.log("getBookableHistory()_Addition: ", addition);

                    var total = bookings.concat(addition.items);

                    actualizePopBookableHistory(total, elem);
                });

            }
        });
    },

    getBookingsNbrBetween: function (start,end,bookableId = "%",elem=document.body,writeIfOne = true) {
        var filter = {
            filter: {
                groups: [
                    {
                        joins: {
                            bookables: {
                                conditions: [{
                                    id: {
                                        equal: {
                                            value: bookableId
                                        }
                                    }
                                }]
                            }
                        }
                    },
                    {    
                    conditions: [{
                        startDate: {
                            between: {
                                from: start,
                                to:end
                            }
                        }
                    }]                                               
                    }
                ]
            },
            pagination: {
                pageSize: 0,
                pageIndex: 0
            }
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(result => {
            console.log("getBookingsNbrBetween(): ", result.length + " sorties", result);
            if (result.length != 1 || writeIfOne == true) {
                elem.innerHTML += result.length;
                elem.parentElement.style.opacity = 1;
            }     
            else {
                //elem.parentElement.style.display = "none";
            }
        });
    },

    // getBookingInfos
    getBookingInfos: function (bookingId, elem) {

        var filter = {
            filter: {
                groups: [
                    { conditions: [{ id: { like: { value: bookingId } } }] }
                ]
            },
            pagination: {
                pageSize: 1,
                pageIndex: 0
            },
            sorting: [{
                field: "id", //USELESS
                order: "ASC" //USELESS
            }]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(result => {
            console.log("getBookingInfos(): ", result);
            actualizePopBooking(result.items[0], elem);
        });
    },

    getBookingFinishInfos: function (bookingId, elem) {

        var filter = {
            filter: {
                groups: [
                    { conditions: [{ id: { like: { value: bookingId } } }] }
                ]
            },
            pagination: {
                pageSize: 1,
                pageIndex: 0
            },
            sorting: [{
                field: "id", //USELESS
                order: "ASC" //USELESS
            }]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(result => {
            console.log("getBookingFinishInfos(): ", result);
            actualizePopBookingFinish(result.items[0],elem);
        });
    },

    // finishBooking
    terminateBooking: function (bookingId, comment) {
        alert(comment);
        Server.bookingService.flagEndDate(bookingId, comment).subscribe(result => {
            Requests.getActualBookingList(true);
        });
    },

    //createBooking
    createBooking: function (i) {

        var input = {
            owner: Cahier.bookings[i].owner.id,
            participantCount: Cahier.bookings[i].participantCount,
            destination: Cahier.bookings[i].destination,
            startComment: Cahier.bookings[i].startComment,
            guest: Cahier.bookings[i].guest
        };

        if (Cahier.bookings[i].guest == true) {
            console.log('Invité');
            input = {
                participantCount: Cahier.bookings[i].participantCount,
                destination: Cahier.bookings[i].destination,
                startComment: "[" + Cahier.bookings[i].guestName + "] " + Cahier.bookings[i].startComment,
                guest: Cahier.bookings[i].guest
            };
        }


        Server.bookingService.create(input).subscribe(booking => {

            console.log('Created booking : ', booking);

            //modifier c to alalalalla 

            // LINK BOOKABLE
            if (Cahier.bookings[i].bookables.length != 0) {
                Server.linkMutation.link(booking, {
                    id: Cahier.bookings[i].bookables[0].id,
                    __typename: 'Bookable'
                }).subscribe(() => {
                    console.log('Linked Bookable : ', booking);
                    Requests.getActualBookingList(true);
                });
            }
            else {
                console.log("Matériel Personel");
                Requests.getActualBookingList(true);
            }
        });

        
    },

    // createBooking
    //createBooking: function () {

    //    var input = {
    //        owner: Cahier.personId,
    //        participantCount: Cahier.nbrParticipants + 0,
    //        destination: Cahier.destination,
    //        startComment: Cahier.startComment

    //    };

    //    if (Cahier.personId == "") {
    //        console.log('Invité');
    //        input = {
    //            participantCount: Cahier.nbrParticipants + 0,
    //            destination: Cahier.destination,
    //            startComment: "[" + Cahier.personFirstName + "] " + Cahier.startComment
    //        };
    //    }


    //    Server.bookingService.create(input).subscribe(booking => {

    //        console.log('Created booking : ', booking);

    //        // LINK BOOKABLE
    //        if (Cahier.bookableId != "") {
    //            Server.linkMutation.link(booking, {
    //                id: Cahier.bookableId,
    //                __typename: 'Bookable'
    //            }).subscribe(() => {
    //                console.log('Linked Bookable : ', booking);
    //                Requests.getActualBookingList(true);
    //            });
    //        }
    //        else {
    //            console.log("Matériel Personel");
    //            Requests.getActualBookingList(true);
    //        }
    //        });    
    //},


    // personalQuery
    personalQuery: function () {

        var TheQuery = Server.gql`
        {
              bookables(
                filter:{
      
                  groups:[{
        
                    conditionsLogic:OR
        
        
                    conditions:[
                      {
                        id:{
                          like:{
                            value:"%3001%"
                          }
                        }
                        name:{
                          like:{
                            value:"%R15%"
                          }
                        }
                      }
                    ]}
        
        
        
                  ]
      
                },
                sorting: [{
    	            field:id
                  order:DESC
                }]
              )
              {
                  items {
                    id
                    name
                    description
        
                    tags {
                      id
                    }

                  }
                }
            }
            `;

        Server.apollo.query({ query: TheQuery }).subscribe(result => {
            console.log("Result of Requests.createQuery(): ", result);
        });
    }








};
