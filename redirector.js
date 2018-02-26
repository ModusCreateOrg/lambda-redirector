'use strict';

/**
 * Handles GET requests.
 * 
 * Can be altered to handle any request method as long as swagger.yml is
 * configured for those endpoints.
 */
module.exports.get = (event, context, callback) => {
    // Prevent crashing due to uncallable callbacks.
    // See: http://justbuildsomething.com/node-js-best-practices/#5
    callback = (typeof callback === 'function') ? callback : function() {};

    if (isProxy(event)) {
        var path = event.path.substring(1);
        var queries = event.queryStringParameters;
    } else {
        var path = "";
        var queries = event.params.querystring;
    }

    var query = assembleQuery(queries);
    var requestUri = assembleRequest(path, query);
    var response = assembleResponse(event, requestUri);

    callback(null, response);
};

// Handles POST requests.
module.exports.other = (event, context, callback) => {
    // Prevent crashing due to uncallable callbacks.
    // See: http://justbuildsomething.com/node-js-best-practices/#5
    callback = (typeof callback === 'function') ? callback : function() {};

    if (isProxy(event)) {
        var path = event.path.substring(1);
        var queries = event.queryStringParameters;
    } else {
        var path = "";
        var queries = event.params.querystring;
    }

    var query = assembleQuery(queries);
    var requestUri = assembleRequest(path, query);
    var response = assembleResponse(event, requestUri);

    callback(null, response);
};

/**
 * Determines if the incoming request is a proxy integration or not.
 *
 * See: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * See: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html
 */
function isProxy(event) {
    if (typeof event.path == "undefined") {
        // Non proxy
        return false;
    }
    // Proxy
    return true;
}

/**
 * Assembles query parameters.
 */
function assembleQuery(queries) {
    var query = [];
    for (var property in queries) {
        if(queries.hasOwnProperty(property)) {
            query.push(property + "=" + queries[property]);
        }
    }
    return query.join('&');
}

/**
 * Assembles request path.
 */
function assembleRequest(path, query) {
    if (0 === Object.keys(query).length) {
        // There are no query vars so just use path.
        return path;
    }
    return [path, query].join("?");
}

/**
 * Assembles response based on the integration (proxy or non-proxy).
 */
function assembleResponse(event, requestUri) {
    if (isProxy(event)) {
        return {
            "statusCode": 302,
            "headers": {
                "Location": process.env.NEW_DOMAIN + requestUri
            },
            "body": "",
            "isBase64Encoded": false
        };
    }
    return { location : process.env.NEW_DOMAIN + requestUri };
}