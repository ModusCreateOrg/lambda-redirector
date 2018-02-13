'use strict';

exports.handler = function(event, context) {
    var resource_path = JSON.stringify(event.context["resource-path"]);
    resource_path = resource_path.replace(/"/g, '');
    resource_path = resource_path.substring(1);

    context.succeed({
        location : process.env.NEW_GET_DOMAIN + resource_path
    });
};