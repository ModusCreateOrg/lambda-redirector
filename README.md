# Lambda Redirector
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FModusCreateOrg%2Flambda-redirector.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FModusCreateOrg%2Flambda-redirector?ref=badge_shield)

Redirect an entire website using [AWS Lambda](https://aws.amazon.com/lambda/) and [API Gateway](https://aws.amazon.com/api-gateway/), packaged with [CloudFormation](https://aws.amazon.com/cloudformation/) and deployed with [Serverless Application Model (SAM)](https://aws.amazon.com/about-aws/whats-new/2016/11/introducing-the-aws-serverless-application-model/).

# Table of Contents
 - [About](#about)
   - [The Problem](#the-problem)
   - [The Solution](#the-solution)
 - [Usage](#usage)
   - [Setting Up](#setting-up)
   - [Package](#package)
   - [Deploy](#deploy)
     - [Parameters](#parameters)
   - [Deleting a Stack](#deleting-a-stack)
 - [Caveat](#caveat)
 - [Contributing](#contributing)
 - [Legal](#legal)

# About

## The Problem
If you've migrated from one domain to another and you want to redirect all incoming requests from the old domain to the new one, you'd typically do the following:
1. Create a webserver with either Apache or NGINX that listens to incoming requests.
2. Rewrite all requests to the new domain while passing appropriate headers (`301`/`302` HTTP status with a `Location` header).

This works fine except you have to run a whole webserver just to manage this.

## The Solution
We could use API Gateway as an entrypoint for requests and map those requests to our Lambda function. This way, we utilize a resource only when it's needed. Lambda is ideal for this use case since this is not a long lived process and it's also very specialized and the behaviour well defined.

We've used CloudFormation to define our Lambda functions and in the function definition, we've specified that requests coming into API Gateway would act as a trigger for our Lambda functions. We've also specified that GET requests are handled by one function and all other HTTP methods are handled by another.

Finally, we use AWS SAM to package and deploy our code.

# Usage
Assumptions:
 - **MyRedirectorBucket** is the name of the bucket we'll be uploading our packaged Lambda code to.
 - **Redirector** is the name of our CloudFormation stack.
 - **http://example.org/** is the new domain we are redirecting to.

## Setting Up
Make sure our S3 bucket exists, if not, create it
```
aws s3 ls s3://MyRedirectorBucket/ > /dev/null 2>&1 || aws s3 mb s3://MyRedirectorBucket
```

Validate our CloudFormation template to make sure there are no errors
```
aws cloudformation validate-template --template-body file://./app_spec.yml
```

## Package
Package and upload local artifacts to S3
```
aws cloudformation package \
    --template-file app_spec.yml \
    --output-template-file packaged.yml \
    --s3-bucket MyRedirectorBucket
```

## Deploy
Deploys the CloudFormation template by creating and executing a changeset.
```
aws cloudformation deploy \
    --template-file packaged.yml \
    --stack-name Redirector \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
        NewDomain=http://example.org \
        HTTPResponse=301
```

*Note*: Ensure that NewDomain is prefixed with either `http://` or `https://` or you will get a chain of redirects to a never-ending path on the source domain. It will be amusing but will not meet your goal.

*Note*: This redirector has a special feature where if you specify either a query parameter or a non-slash-terminated string in the NewDomain URL (e.g. ``https://www.example.com/snafu` or `https://www.example.com/some/path?foo=bar") it will disregard the path and any query parameters passed in by the user and will redirect strictly to the NewDomain URL.

### Parameters
Parameters | Type | Description
---|:---:|---
HTTPResponse | `Number` | The HTTP response to redirect with. Only `301` and `302` are allowed.
NewDomain | `String` | New domain to redirect to.

### Deleting a Stack
While testing, you may need to delete a stack
```
aws cloudformation delete-stack --stack-name Redirector
```

# Configuring target domains for redirection

In order to fully configure a target domain for redirection, first establish a `Redirector` API Gateway through the CloudFormation Stack as described above. Then add a [Custom Domain Mapping through the AWS Console](https://console.aws.amazon.com/apigateway/home#/custom-domain-names). You can add a Custom Domain Name through the console, give it a DNS name, tell it to use an _Edge Optimized_ endpoint configuration, and give it a valid ACM certificate for the domain you are targeting. This can be a wildcard certificate, which might make things simpler for you if you are configuring multiple domains. Then Edit the custom domain name and do an _Add mapping_ operation to add a Base Path Mapping to map `/` to the `Redirector` Prod stage.

Once this is configured, look for the _Target Domain Name_ under the Custom Domain Name / Endpoint Configuration in the console and chnage that to the DNS name you want to redirect _from_.


# Caveat:
The first version of this software had the same issue as SAM [bug #191](https://github.com/awslabs/serverless-application-model/issues/191). If you look at the Stages in your API Gateway, you may find a stage named `Stage`. As of 2019-11-15 this issue is resolved and new deployments of `lambda-redirector` should not have a `Stage` stage defined.

# Contributing:
See: http://www.contribution-guide.org/

# Legal
Copyright 2018 by Modus Create, Inc. 

This software is licensed under the permissive [MIT License](LICENSE.md).


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FModusCreateOrg%2Flambda-redirector.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FModusCreateOrg%2Flambda-redirector?ref=badge_large)