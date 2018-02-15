'use strict';

exports.handler = (event, context, callback) => {
    if (typeof event.path == "undefined") {
        // Non proxy
        var path = "";
        var queries = event.params.querystring;
    } else {
        // Proxy
        var path = event.path.substring(1);
        var queries = event.queryStringParameters;
    }

    var query = [];
    
    for (var property in queries) {
        if(queries.hasOwnProperty(property)) {
            query.push(property + "=" + queries[property]);
        }
    }
    query = query.join('&');

    var requestUri = [path, query].join("?");
    if (0 === Object.keys(query).length) {
        requestUri = path;
    }
    
    console.log(requestUri);


    if (typeof event.path == "undefined") {
        // Non proxy
        callback(null, {
            location : process.env.NEW_GET_DOMAIN + requestUri
        });
    } else {
        var response = {
            "statusCode": 302,
            "headers": {
                "Location": process.env.NEW_GET_DOMAIN + requestUri
            },
            "body": "",
            "isBase64Encoded": false
        };
        callback(null, response);
    }
};