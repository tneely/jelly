# Jelly

Jelly is a high level CDK construct that defines everything you'll need to deploy a JAMstack application.

## Usage

This package contains an example application that leverages Jelly.
Check out the [API][1], [client][2], and [infrastructure][3].

[1]: example/packages/api
[2]: example/packages/app
[3]: example/packages/infrastructure

### Install

```
npm install cdk-jelly
```

### Declaration

```typescript
new Jelly(this, {
  appName: "ExampleJellyApp",
  api: {
    code: lambda.Code.fromAsset("../api/dist"),
  },
  app: {
    source: s3deploy.Source.asset("../app/build"),
  },
  domain: {
    name: "cdk-jelly.com",
  },
});
```

### Routing

If using a custom domain name, Jelly uses Route 53 to act as a DNS for your application.
Jelly also leverages AWS Certificate Manager and CloudFormation's DNS validation to provide HTTPS across your domain and subdomains.

When deploying a Jelly application for the first time, you will need to register the name servers in your root domain's hosted zone with your domain provider. The stack deployment will hang until the certificates can be verified through DNS.

### API

The API lambda will always have two environment variables available for use.

- `DATABASE_NAME` the DynamoDB table name
- `AUTH_LAMBDA_ARN` the authentication lambda ARN

The API lambda has full access to both of these resources.

## Roadmap

### Housekeeping

- Strict return types
- Documentation
- Testing

### Enhancements

- Expose customization options
  - Lambda runtime, env variables
  - Table options
- Improve [Observatory score](https://observatory.mozilla.org/analyze/cdk-jelly.com)
- GitHub actions for releases and such
- Dashboards, alarms, etc.
- Precompile lambda instead of relying on NodejsFunction?

## Troubleshooting

### Auth Lambda

The authentication lambda uses [NodejsFunction][4] to package its code.
For whatever reason, this module requires Docker. If running locally, you'll need to install Docker.
If running from CodeBuild, you'll need to run with elevated privileges (otherwise Docker access is blocked). If this becomes a large enough barrier, we can just write our own bundling code.

[4]: https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-nodejs-readme.html

## Available Scripts

In the project directory, you can run:

### `npm run build`

Compiles typescript to js

### `npm run watch`

Watches for changes and compile

### `npm run test`

Performs the jest unit tests

### `install-example`

Installs all packages in the example application

### `build-example`

Builds all packages in the example application

### `synth-example`

Synthesizes the infrastructure in the example application
