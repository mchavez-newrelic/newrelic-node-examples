'use strict'

const newrelic = require('newrelic');
newrelic.instrumentDatastore('@elastic/elasticsearch', instrumentElastic);

function instrumentElastic(shim, elastic, moduleName) {
    function queryParser(params) {
        debugger
        // TODO: depending on the elastic search request the params need 
        // further logic applied to determine the operation
        params = JSON.parse(params);
        const path = params.path.split('/');
        debugger
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
    // const ClientLibrary = elastic.Client;
    
    // shim.recordOperation(ClientLibrary.BaseConnectionPool.prototype, 'addConnection', function wrapAddConnection(shim, fn, fnName, args) {
    //     debugger
    //     const parameters = {'host': args[0]};
    //     const newArgs = [args[0], fn];
    
    //     return {
    //         fnName,
    //         parameters,
    //         promise: true
    //     }
    // })

    shim.recordQuery(Transport.prototype, 'request', function(shim, request, name, args) {
        debugger
        return {
            query: JSON.stringify(args?.[0]),
            promise: true
        }
    });
}