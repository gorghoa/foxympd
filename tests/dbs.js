define([],function() {
var db = {
         id: "foxympd-test",
            description: "The database for foxympd",
            migrations: [{
                version: 1,
                migrate: function (transaction, next) {
                    var store = transaction.db.createObjectStore("connections");
                    next();
                }
            }]
        };

   var dbs = {"default":db};
   return dbs;
});

