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
        if ($('divTabCahierMaterielElementsSelectIcon').style.backgroundImage == 'url("Img/IconBack.png")') {
            sort = "ASC";
        }
        else {
            sort = "DESC";
        }

        var whichField = "id";

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



    // Add an item
    addResource: function () {
        const item = { name: 'R' + Date.now(), description: "Bonsoir" };
        Server.resourceService.create(item).subscribe(result => {
            console.log('Resource created', result);
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
