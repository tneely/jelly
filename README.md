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

> - You must create this file, as it is ignored by Git to prevent accidentally commit sensitive information. It must contain a `githubKey` field that contains your personal the GitHub API token. This must give AWS read access to your app's repository.

2. `app-config.json`

> - This file points to your app's repository in GitHub. Replace `appName` with the name of your application. Replace the values for `owner` and `repo` with the ones for your application.
