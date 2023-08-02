'use strict'

const newrelic = require('newrelic');
newrelic.instrumentDatastore('@elastic/elasticsearch', instrumentElastic);

function instrumentElastic(shim, elastic, moduleName) {
    function queryParser(params) {
        // TODO: depending on the elastic search request the params need 
        // further logic applied to determine the operation
        params = JSON.parse(params);
        const path = params.path.split('/');
        return {
            collection: path?.[1],
            operation: path?.[2]?.replace('_',''),
            query: JSON.stringify(params?.body?.query)?.replaceAll('"',''),
        }
    }

    shim.setDatastore("elastic");
    shim.setParser(queryParser);
    
    // cwd is node_modules/@elastic/elasticsearch w/ shim.require so use the relative path
    const Transport = elastic.Transport;
    
    // shim.recordOperation(Transport.prototype, 'addConnection', function (shim, addConnection, name, args) {
    //     const parameters = {'host': args[0]};
    
    //     return {
    //         name,
    //         parameters,
    //         promise: true
    //     }
    // })

    shim.recordQuery(Transport.prototype, 'request', function(shim, request, name, args) {
        // simply grab the first connection in the connection pool
        const connection = this.connectionPool.connections[0];
        return {
            query: JSON.stringify(args?.[0]),
            promise: true,
            inContext: function inContext() {
                shim.captureInstanceAttributes(
                    connection.url.toString(),
                    9200,
                )
            },
        }
    });
}