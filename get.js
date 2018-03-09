'use strict';

var helper = require('lambda-redirector-helpers');

/**
 * Handles GET requests.
 *
 * Can be altered to handle any request method as long as swagger.yml is
 * configured for those endpoints.
 */
module.exports.handler = (event, context, callback) => {
    // Prevent crashing due to uncallable callbacks.
    // See: http://justbuildsomething.com/node-js-best-practices/#5
    callback = (typeof callback === 'function') ? callback : function() {};

    var query = helper.assembleQuery(event.queryStringParameters);
    var requestUri = helper.assembleRequest(event.path, query);
    var response = helper.assembleResponse(requestUri);

    callback(null, response);
};