```
       _      _ _
      | |    | | |
      | | ___| | |_   _
  _   | |/ _ \ | | | | |
 | |__| |  __/ | | |_| |
  \____/ \___|_|_|\__, |
                   __/ |
                  |___/
```

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

- Testing
- Update READMEs

### Enhancements

- GitHub actions for releases and such
- Dashboards, alarms, pipeline tests, etc.
- Lerna -> Rush
  - https://www.npmjs.com/package/@rushstack/eslint-config
  - https://rushstack.io/pages/heft_tutorials/getting_started/
  - https://rushjs.io/

## Troubleshooting

Well this isn't helpful.

## Available Scripts

In the project directory, you can run:

### `npm run build`

Compiles typescript to js

### `npm run test`

Performs the jest unit tests

### `example-install`

Installs all packages in the example application

### `example-build`

Builds all packages in the example application

### `example-synth`

Synthesizes the infrastructure in the example application
