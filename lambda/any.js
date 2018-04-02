'use strict';

var helper = require('./lib/helper');

/**
 * Handles everything except GET requests.
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
