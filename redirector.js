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

    var query = assembleQuery(event.queryStringParameters);
    var requestUri = assembleRequest(event.path, query);
    var response = assembleResponse(requestUri);

    callback(null, response);
};

// Handles everything except GET requests.
module.exports.any = (event, context, callback) => {
    // Prevent crashing due to uncallable callbacks.
    // See: http://justbuildsomething.com/node-js-best-practices/#5
    callback = (typeof callback === 'function') ? callback : function() {};

    var query = assembleQuery(event.queryStringParameters);
    var requestUri = assembleRequest(event.path, query);
    var response = assembleResponse(requestUri);

    callback(null, response);
};

/**
 * Assembles query parameters.
 */
function assembleQuery(queries) {
    var query = [];
    for (var property in queries) {
        query.push(property + "=" + queries[property]);
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
 * Assemble the response to send to API Gateway.
 */
function assembleResponse(requestUri) {
    return {
        statusCode: process.env.HTTP_RESPONSE,
        headers: {
            "Location": process.env.NEW_DOMAIN + requestUri
        },
        body: null
    }
}