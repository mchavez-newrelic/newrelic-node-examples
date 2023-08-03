'use strict'

const newrelic = require('newrelic');
newrelic.instrumentDatastore('@elastic/elasticsearch', instrumentElastic);

function instrumentElastic(shim, elastic, moduleName) {
    function queryParser(params) {
        params = JSON.parse(params);
        const path = params.path.split('/');
        const method = params.method;

        let operation = "other";
        let query = JSON.stringify(params?.body)?.replaceAll('"','');
        if (path?.[2] === "_doc" && method === "PUT") {
            operation = "create";
        }
        else if (path?.[2] === "_doc" && method === "DELETE") {
            operation = "delete";
            query = `{ title: ${path?.[3]?.replaceAll('%20', ' ')} }`;
        }
        else if (path?.[2] === "_search" && method === "POST") {
            operation = "search";
        }

        return {
            collection: path?.[1],
            operation,
            query,
        }
    }

    shim.setDatastore("elastic");
    shim.setParser(queryParser);
    
    // cwd is node_modules/@elastic/elasticsearch w/ shim.require so use the relative path
    const Transport = elastic.Transport;

    shim.recordQuery(Transport.prototype, 'request', function(shim, _, __, args) {
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
