# Lambda Redirector
Redirect an entire website using [AWS Lambda](https://aws.amazon.com/lambda/) and [API Gateway](https://aws.amazon.com/api-gateway/), packaged with [CloudFormation](https://aws.amazon.com/cloudformation/).

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
 - [Contributing](#contributing)
 - [Legal](#legal)

## About
### The Problem
If you've migrated from one domain to another and you want to redirect all incoming requests from the old domain to the new one, you'd typically do the following:
1. Create a webserver with either Apache or NGINX that listens to incoming requests.
2. Rewrite all requests to the new domain while passing appropriate headers (`301`/`302` HTTP status with a `Location` header).

This works fine except you have to run a whole webserver just to manage this.

### The Solution
We could use API Gateway as an entrypoint for requests and map those requests to our Lambda function. This way, we utilize a resource only when it's needed. Lambda is ideal for this use case since this is not a long lived process and it's also very specialized and the behaviour well defined.

We've used CloudFormation to define our resources. However, we've split up our API Gateway definition into a separate file called `swagger.yml`.

The behaviour defined is:
 - API Gateway is defined in swagger.yml and it listens to every request.
 - Based on an HTTP method (i.e., GET, POST, PUT, etc.), we can configure API Gateway to route the request to a handler in a Lambda function.
 - Using Swagger, again, we can instruct API Gateway to pass on request parameters to the Lambda function using [Request Templates](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html). In our case, this makes the request parameters available via `event`, in Lambda.
 - In Lambda, we can then decide on how we redirect the user.

## Usage
Assumptions:
 - **MyRedirectorBucket** is the name of the bucket we'll be uploading our swagger definition and packaged Lambda code to.
 - **Redirector** is the name of our CloudFormation stack.
 - **http://example.org/** is the new domain we are redirecting to.

### Setting Up
Make sure our S3 bucket exists, if not, create it
```
aws s3 ls s3://MyRedirectorBucket/ > /dev/null 2>&1 || aws s3 mb s3://MyRedirectorBucket
```

Upload our Swagger file to the bucket so that CloudFormation can grab it
```
aws s3 cp ./swagger.yml s3://MyRedirectorBucket/swagger.yml
```

Validate our CloudFormation template to make sure there are no errors
```
aws cloudformation validate-template --template-body file://./app_spec.yml
```

### Package
Package and upload local artifacts to S3
```
aws cloudformation package \
    --template-file app_spec.yml \
    --output-template-file packaged.yml \
    --s3-bucket MyRedirectorBucket
```

### Deploy
Deploys the CloudFormation template by creating and executing a changeset.
```
aws cloudformation deploy \
    --template-file packaged.yml \
    --stack-name Redirector \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
        StageName=Staging \
        NewDomain=http://example.org/ \
        SwaggerFileBucket=MyRedirectorBucket \
        SwaggerFileName=swagger.yml
```

#### Parameters
Parameters | Type | Description
---|:---:|---
StageName | `String` | Name of the [Stage](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-stages.html). Caveat: https://github.com/awslabs/serverless-application-model/issues/191
NewDomain | `String` | New domain to redirect to.
SwaggerFileBucket | `String` | The bucket that the swagger file `SwaggerFileName` is uploaded to.
SwaggerFileName | `String` | The file name of the swagger file. Eg: 'swagger.yml'.

### Deleting a Stack
While testing, you may need to delete a stack
```
aws cloudformation delete-stack --stack-name Redirector
```

## Contributing:
See: http://www.contribution-guide.org/

## Legal
Copyright 2018 by Modus Create, Inc. 

This software is licensed under the permissive [MIT Licensed](LICENSE.md).