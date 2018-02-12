// TODO: Fix IAM so API Gateway and Lambda are the only ones that need permissions.
// See: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html?icmpid=docs_iam_console

'use strict';

// Should handle all requests other than GET.
exports.handler = function(event, context) {
    context.succeed({
        location : process.env.NEW_OTHER_DOMAIN
    });
};