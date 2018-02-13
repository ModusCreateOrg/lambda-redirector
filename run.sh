#!/usr/bin/env bash

# Less eager word splitting - no space.
IFS=$'\n\t'

# Exit if any command has a non-zero exit status.
set -e

# Exit if script uses undefined variables.
set -u

# Prevent masking an error in a pipeline.
set -o pipefail

# set -x

BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

VERB=${1:-}

TEMPLATE_FILE_NAME='app_spec.yml'
PACKAGE_FILE_NAME='packaged_spec.yml'
STACK_NAME='Redirector'

ACCOUNT_ID=$(aws iam get-user | grep 'arn:aws:iam' | cut -d ":" -f6)
ACCOUNT_ALIAS=$(aws iam list-account-aliases --query 'AccountAliases' --output text)
BUCKET_NAME="${ACCOUNT_ID}-redirector"
REGION=$(aws configure get region)

# Vars used in YAML files, injected via Jinja2
title="Redirector"
basePath="/test"
paths="/"
StageName="test"
NEW_GET_DOMAIN="https://get.com/"
NEW_OTHER_DOMAIN="https://other.com/"

echo "Targeting region $REGION in AWS Account $ACCOUNT_ALIAS ($ACCOUNT_ID)"

evaluate() {
    for templates in app_spec swagger; do
        jinja2 "${BASE}"/"$templates".yml.j2 \
            -D title="$title" \
            -D basePath="$basePath" \
            -D paths="$paths" \
            -D StageName="$StageName" \
            -D NEW_GET_DOMAIN="$NEW_GET_DOMAIN" \
            -D NEW_OTHER_DOMAIN="$NEW_OTHER_DOMAIN" \
            -D REGION="$REGION" \
            -D ACCOUNT_ID="$ACCOUNT_ID" \
            > "${BASE}"/"$templates".yml
    done
}

# Validate CF template.
validate() {
    aws cloudformation validate-template --template-body file://"${BASE}"/"${TEMPLATE_FILE_NAME}"
}

prepare() {
    aws s3 ls "${BUCKET_NAME}" > /dev/null 2>&1 || aws s3 mb s3://"${BUCKET_NAME}"
}

# Try to create CloudFormation package
package() {
    if aws cloudformation package --template-file ${TEMPLATE_FILE_NAME} --output-template-file ${PACKAGE_FILE_NAME} --s3-bucket "${BUCKET_NAME}"; then
        echo "CloudFormation successfully created the package ${PACKAGE_FILE_NAME}"
    else
        echo "Failed creating CloudFormation package"
        exit 1
    fi
}

# Try to deploy the package
deploy() {
    if aws cloudformation deploy --template-file ${PACKAGE_FILE_NAME} --stack-name ${STACK_NAME} --capabilities CAPABILITY_IAM; then
        echo "CloudFormation successfully deployed the serverless app package"
    else
        echo "Failed deploying CloudFormation package"
        exit 1
    fi
}

delete() {
    aws cloudformation delete-stack --stack-name ${STACK_NAME}
}

info() {
    REST_API_ID=$(aws cloudformation list-stack-resources --stack-name ${STACK_NAME} | grep -A1 'AWS::ApiGateway::RestApi' | grep 'PhysicalResourceId' | awk '{print $2}' | tr -d '"' | tr -d ",")
    REST_API_URL="https://${REST_API_ID}.execute-api.${REGION}.amazonaws.com/${StageName}"

    echo "The redirect url is ${REST_API_URL}${paths}"
}

case "$VERB" in
    "validate"|"evaluate"|"prepare"|"package"|"deploy"|"info")
        $VERB
    ;;

    "delete")
        delete
    ;;

    *)
        evaluate
        validate
        prepare
        package
        deploy
        info
    ;;
esac

exit 0