var Server;
function ServerInitialize() {
    // Get the API
    Server = window.ichtusApi;
    console.warn('Server(API) = ', Server);

  //  Requests.getItemList();

   // getCountries();
   // Requests.createQuery();
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









    // createQuery
    createQuery: function (table = "bookings", conditions, sorting, items) { // marche pas ?

        var TheQuery = Server.gql`
        {
            `+ a + `{
                items {
                    id
                }
            }
        
        }`;

        Server.apollo.query({ query: TheQuery }).subscribe(result => {
            console.log(table + " Query", result);
           // return result;
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

