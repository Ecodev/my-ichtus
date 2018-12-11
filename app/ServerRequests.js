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



var a = "bookings";
var Requests = {

    // login
    login: function (pwd) {
        alert("ok");
        Server.userService.login({
            login: 'administrator',
            password: pwd
        }).subscribe(result => {
            console.log(result);
            alert("logged");
        });
    },


    // getUsersList FOR CAHIER.JS
    getUsersList: function (text = "", nbr = 5) {
        var filter = {
            filter: {
                groups: [
                    { conditions: [{ name: { like: { value: '%' + text + '%' } } }] }
                ]
            },
            pagination: {
                pageSize: nbr,
                pageIndex: 0
            },
            sorting:[{
                field: 'name', 
                order: 'DESC'
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

        var sort;
        if ($('divTabCahierMaterielElementsSelectIconSort').style.backgroundImage == 'url("Img/IconSortDESC.png")') {
            sort = "DESC";
        }
        else {
            sort = "ASC";
        }

        var whichField = $('divTabCahierMaterielElementsSelectSort').getElementsByTagName("select")[0].value;

        var txt = $('inputTabCahierMaterielElementsInputSearch').value;

        var categorie = $('divTabCahierMaterielElementsSelectCategorie').getElementsByTagName("select")[0].value;
        if (categorie == "all") { categorie = ""; }

        //alert(categorie);

        var f = {
            filter: {
                groups: [
                    {
                        groupLogic:'AND',
                        conditionsLogic:'OR',
                        conditions: [
                            {
                                name: {
                                    like: {
                                        value: "%" + txt + "%"
                                    }
                                }
                            },
                            { //enlever dans le futur
                                id: {
                                    like: {
                                        value: "%" + txt + "%"
                                    }
                                }
                            },
                            {
                                code: {
                                    like: {
                                        value: "%" + txt + "%"
                                    }
                                }
                            }
                        ]
                    },
                    {       //CATEGORIES...
                        groupLogic: 'AND',
                        conditionsLogic: 'AND',
                        conditions: [
                            {
                                bookingType: {
                                    like: {
                                        value: "self_approved"
                                    }
                                }
                            }
                        ],
                        joins: {
                            type: {
                                conditions: [{
                                    name: {
                                        like: {
                                            value:"%" + categorie
                                        }
                                    }
                                }]
                            }
                        }

                    }
                ]
            },
            sorting: [
                { field: whichField, order: sort }
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
            loadElements(result.items);
        });
    },

    // getBookableInfos
    getBookableInfos: function (bookableId) {

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
                order:"ASC" //USELESS
            }]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookableService.getAll(variables).subscribe(result => {
            console.log("getBookableInfos(): ", result);
            actualizePopBookable(result.items);
        });
    },


    // Add an item
    addBookable: function (_name, _description) {

        const item = { name: "1", description: "kj", bookingType: "self_approved" , type:6004};

        Server.bookableService.create(item).subscribe(result => {
            console.log('Bookable created', result);
        });

    },


    getBookingList: function () {

        var filter = {
            filter: {
                groups: [
                    {}
                ]
            },
            pagination: {
                pageSize: 20,
                pageIndex: 0
            },
            sorting: [
                { field: "id", order: "DESC" }
            ]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(result => {
            console.log("getBookingList(): ", result);
            actualizeActualBookings(result.items);
        });

    },

    // getBookingInfos
    getBookingInfos: function (bookingId) {

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
            actualizePopBooking(result.items);
        });
    },

    // createBooking
    createBooking: function () {

        alert(Cahier.nbrAccompagnants);


        // Get all items
        Server.bookingService.create({

            participantCount: Cahier.nbrAccompagnants,
            destination: Cahier.destination,
            startComment: Cahier.startComment

        }).subscribe(booking => {

            console.log('Created booking : ', booking);

            // LINK BOOKABLE
            Server.linkMutation.link(booking, {
                id: Cahier.bookableId,
                __typename: 'Bookable'
            }).subscribe(() => {
                console.log('Linked Bookable : ', booking);
                Requests.getBookingList();
            });

            // LINK RESPONSIBLE
      //      Server.linkMutation.link(booking, {
           //     id: Cahier.personId,
        //        __typename: 'Responsible'
        //    }).subscribe(() => {
        //        console.log('Linked Responsible : ', booking);
       //     });

        });

    },


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
