var Server;
function ServerInitialize() {
    // Get the API
    Server = window.ichtusApi;
    console.warn('Server(API) = ', Server);

  //  Requests.getItemList();

   // getCountries();
 //  Requests.createQuery();
   // Requests.addResource();

 //   Requests.personalQuery();
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
            sort: { //sorting ? ["] ?
                field: 'name', //Marche pas ???
                order: 'DESC'
            }
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.userService.getAll(variables).subscribe(result => {
            console.log("getUsersList(): ", result);
            createSearchEntries(result.items);
        });
    },

    // getResourcesList
    getResourcesList: function () {

        var sort;
        if ($('divTabCahierMaterielElementsSelectIconSort').style.backgroundImage == 'url("Img/IconSortDESC.png")') {
            sort = "DESC";
        }
        else {
            sort = "ASC";
        }

        var whichField = $('divTabCahierMaterielElementsSelectSort').getElementsByTagName("select")[0].value;

        var f = {
            filter: {
                groups: [{
                    conditionsLogic:'OR',
                    conditions: [{
                        name: {
                            like: {
                                value: "%" + $('inputTabCahierMaterielElementsInputSearch').value + "%"
                            }
                        }
                    },
                    {
                        id: {
                            like: {
                                value: "%" + $('inputTabCahierMaterielElementsInputSearch').value + "%"
                            }
                        }
                    }]
                }]
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

        Server.resourceService.getAll(variables).subscribe(result => {
            console.log("getResourcesList(): ", result);
            loadElements(result.items);
        });
    },

    // getResourceInfos
    getResourceInfos: function (resourceId) {

        var filter = {
            filter: {
                groups: [
                    { conditions: [{ id: { like: { value: resourceId } } }] }
                ]
            },
            pagination: {
                pageSize: 1,
                pageIndex: 0
            }
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.resourceService.getAll(variables).subscribe(result => {
            console.log("getResourceInfos(): ", result);
            
        });


    },


    // Add an item
    addResource: function () {
        const item = { name: 'R' + Date.now(), description: "Bonsoir" };
        Server.resourceService.create(item).subscribe(result => {
            console.log('Resource created', result);
        });
    },


    // createBooking
    createBooking: function () {

        alert(Cahier.nbrAccompagnants);
        // Get all items
        Server.bookingService.create({
            destination: "kjlkj",
            //participantCount: Cahier.nbrAccompagnants            
        }).subscribe(booking => {
            console.log('Created booking : ', booking);
            Server.linkMutation.link(booking, {
                id: Cahier.resourceId,
                __typename: 'Resource'
            }).subscribe(() => {
               // getBookingList();
            });

            });

    },


    // personalQuery
    personalQuery: function () {

        var TheQuery = Server.gql`
        {
              resources(
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
