'use strict'

const newrelic = require('newrelic');
newrelic.instrumentDatastore('@elastic/elasticsearch', instrumentElastic);

function instrumentElastic(shim, elastic, moduleName) {
    shim.setDatastore("elastic");
    // cwd is node_modules/@elastic/elasticsearch w/ shim.require so use the relative path
    const TransportLibrary = shim.require('../../@elastic/transport');
    const ClientLibrary = shim.require('../../@elastic/elasticsearch');
    
    shim.recordOperation(ClientLibrary.BaseConnectionPool.prototype, 'addConnection', function wrapAddConnection(shim, fn, fnName, args) {
        debugger
        const parameters = {'host': args[0]};
        const newArgs = [args[0], fn];
    
        return {
            fnName,
            parameters,
            promise: true
        }
    })

    shim.recordQuery(elastic.Transport.prototype, 'request', function wrapRequest() {
        debugger
        return function wrappedRequest() {
            const args = shim.argsToArray.apply(shim, arguments);
            return {
                query: args[3][0].body.query.fuzzy.title,
                promise: true
            }
        }
    });
}