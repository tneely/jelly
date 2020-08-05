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

## Roadmap

### Housekeeping

- Clean up package dependencies
- Strict return types
- Documentation
- Testing

### Enhancements

- Expose customization options
  - Lambda runtime
  - Table options
- Improve [Observatory score](https://observatory.mozilla.org/analyze/cdk-jelly.com)
- GitHub actions for releases and such
- Dashboards, alarms, etc.
- Break verification lambda code out of example and bring it into core Jelly?

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
