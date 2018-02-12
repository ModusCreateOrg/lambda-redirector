// TODO: Fix IAM so API Gateway and Lambda are the only ones that need permissions.
// See: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html?icmpid=docs_iam_console

'use strict';

// Should handle GET requests.
exports.handler = function(event, context) {
    context.succeed({
        location : process.env.NEW_GET_DOMAIN
    });
};