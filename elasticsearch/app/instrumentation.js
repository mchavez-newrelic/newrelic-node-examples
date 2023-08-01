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
            callback: function bindCallback(shim, _f, _n, segment) {
                shim.bindCallbackSegment(newArgs, shim.SECOND, segment)
            }
        }
    })

    shim.recordQuery(TransportLibrary.Transport.prototype, 'request', function(originalFn) {
        debugger
        return function wrappedRequest() {
            const args = shim.argsToArray.apply(shim, arguments)
            shim.addAttribute(args[3])
            return originalFn.apply(this, arguments);
        }
        // return {
        //     promise: true,
        //     query: shim.FIRST
        // }
    });
}