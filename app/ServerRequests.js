var Server;
function ServerInitialize() {
    // Get the API
    Server = window.ichtusApi;
    console.warn('Server(API) = ', Server);

  //  Requests.getItemList();

   // getCountries();
 //  Requests.createQuery();
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
            sorting: {
                field: name, //Marche pas ???
                order:'ASC'
            }
        };
        // Config filters
        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.userService.getAll(variables).subscribe(result => {
            console.log("getUsersList(): ", result);
            createSearchEntries(result.items);
        });
    },

    // getRessourcesList
    getRessourcesList: function (cat) {
        var filter = {
            filter: {
            },
            pagination: {
                pageSize: 20,
                pageIndex: 0
            },
            sorting: {
                field: name, //Marche pas ???
                order: 'ASC'
            }
        };
        // Config filters
        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.resourceService.getAll(variables).subscribe(result => {
            console.log("getRessourcesList(): ", result);
            loadElements(result.items);
        });
    },





    

    // createQuery
    createQuery: function (table = "users", conditions, sorting, items) { 

        var TheQuery = Server.gql`
        {
            `+ table +` 
            {
                items {
                    id 
                    name
                }
            }
        
        }`;

        Server.apollo.query({ query: TheQuery }).subscribe(result => {
            console.log("Result of Requests.createQuery(): ",result);
        });
    },





    // getItemList
    getItemList: function (filter = {}) {

        // Config filters
        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        // Get all items
        Server.itemService.getAll(variables).subscribe(result => {
            console.log('Items list : ', result);
            console.log(result);
        });
    },




}

// Create custom GraphQL query
function getCountries() {
    const customQuery = Server.gql`
                query Countries {
                    countries {
                        items {
                            code
                            name
                        }
                    }
                }`;
    // Execute custom query
    Server.apollo.query({ query: customQuery }).subscribe(result => {
        console.log(result);
    });
}

