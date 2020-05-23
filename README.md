# Welcome to your CDK TypeScript project!

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`InfrastructureStack`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

## Setting up an application

There are two primary files that are needed to serve your application.

1. `secrets.json`

> - ~~You must create this file, as it is ignored by Git to prevent accidentally commit sensitive information. It must contain a `githubKey` field that contains your personal the GitHub API token. This must give AWS read access to your app's repository.~~

2. `app-config.json`

> - This file points to your app's repository in GitHub. Replace `appName` with the name of your application. Replace the values for `owner` and `repo` with the ones for your application.

## Building your website

The CodePipeline will build your project according to the `buildspec.yml` file you define in the repository. The pipeline's build step exposes 3 environment variables that you will need to store during the build step so that your application has access to them at runtime. They are named as follows:

- REACT_APP_AWS_REGION: The AWS region the website is deployed in
- REACT_APP_USER_POOL_ID: The Cognito UserPool the application can connect to to authenticate users
- REACT_APP_USER_POOL_CLIENT_ID: The Cognito UserPool Client the application should run as
- REACT_APP_API_INVOKE_URL: The API Gateway URL that backs your website

TODO: Add versioning, bake time to code deployments
