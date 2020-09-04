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

[1]: example/api
[2]: example/app
[3]: example/infrastructure

### Install

```
npm install cdk-jelly
```

### Declaration

```typescript
new Jelly(this, {
  api: {
    code: lambda.Code.fromAsset(dirname(require.resolve("example-api"))),
  },
  client: {
    source: s3deploy.Source.asset(dirname(require.resolve("example-app"))),
  },
});
```

### Client

```typescript
new Jelly(this, {
  client: {
    source: s3deploy.Source.asset(dirname(require.resolve("example-app"))),
  },
  httpHeaders: { // optional, these are default
    contentSecurityPolicy: "default-src 'self'", // highly recommend changing this default
    strictTransportSecurity: "max-age=63072000; includeSubDomains; preload",
    xContentTypeOptions: "nosniff",
    xXssProtection: "1; mode=block",
    xFrameOptions: "DENY",
    referrerPolicy: "strict-origin-when-cross-origin",
    featurePolicy: "microphone 'self'; geolocation 'self'; camera 'self'",
    accessControlAllowOrigin: "*",
  },
  isSPA: true // optional, this is default
  // ...
});
```

Jelly hosts your client in S3 and distributes it globally using CloudFront. It uses secure HTTP headers by default via Lambda@Edge. Though you need want to relax some of them - especially the CSP.

If you are not creating a single page app, set `isSPA` to `false` in order to not reroute 404s back to your index.html page. 

### API

```typescript
new Jelly(this, {
  api: {
    code: lambda.Code.fromAsset(dirname(require.resolve("example-api"))),
    handlerName: "index.handler", // optional, this is default
    handlerRuntime: lambda.Runtime.NODEJS_12_X, // optional, this is default
    environmentVariables: { // optional, no additional variables is default
      MY_VARIABLE: "myValue",
    },
  },
  // ...
});
```

Jelly deploys your API as a single lambda function. It sets several environment variables out of the box to grant your API access to the resources it needs.

```typescript
baseEnvironmentVariables = {
  `${DATABASE_NAMES}`: table.tableName, // keys in JellyProps.Database.tables mapped to their corresponding table names
  AUTH_LAMBDA_ARN: lambda.functionArn, // name of a lambda used to authenticate users
  AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1", // enables connection reuse in Node.js functions
}
```

### Authentication

```typescript
new Jelly(this, {
  // ...
  withUserAuthentication: true // optional, this is default
});
```

Jelly uses Cognito for user authentication, creating both a user pool and user pool client. You will need to make use of both of these resource IDs in order to authenticate users using tools like Amplify.

We provide an authentication handler that is available to your API through the `AUTH_LAMBDA_ARN` environment variable. You can pass this lambda the Cognito authentication token to verify whether it is valid.

```typescript
const verifyCognitoJwt = async (token: string) => {
  const response = await lambdaClient
    .invoke({
      FunctionName: process.env.AUTH_LAMBDA_ARN!,
      Qualifier: "Prod",
      Payload: JSON.stringify({ token }),
    })
    .promise();

  const payload: VerificationResponse = JSON.parse(response.Payload as string);
  if (!payload.authenticated) {
    throw new Error(`Could not authenticate user: ${payload.errorMessage}`);
  }
};
```

### Database

```typescript
new Jelly(this, {
  // ...
  database: {
    tables: {
      DATABASE_NAME: {
        partitionKey: {
          name: "id",
          type: AttributeType.STRING,
        },
        sortKey: {
          name: "created",
          type: AttributeType.NUMBER,
        },
        timeToLiveAttribute: "ttl",
      },
    },
  },
});
```

Jelly will spin up and make available to your API any number of DynamoDB tables. We directly make use of CDK's `dynamodb.TableProps` interface to define the tables. The keys set in `tables` above are used as environment variables in your API lambda in order to expose the table names.

### Routing

```typescript
new Jelly(this, {
  // ...
  routing: {
    baseDomainName: "cdk-jelly.com",
    apiSubdomain: "api", // optional, this is default
    authSubdomain: "auth", // optional, this is default
  },
});
```

If using a custom domain name, Jelly uses Route 53 to act as a DNS for your application.
Jelly also leverages AWS Certificate Manager and CloudFormation's DNS validation to provide HTTPS across your domain and subdomains.

When deploying a Jelly application for the first time, you will need to register the name servers in your root domain's hosted zone with your domain provider. The stack deployment will hang until the certificates can be verified through DNS.

The base domain name (e.g. cdk-jelly.com) will be set up to redirect to the www subdomain, which serves your app through CloudFront. Jelly will create also subdomains for your API (e.g. api.cdk-jelly.com) and authentication (e.g. auth.cdk-jelly.com) endpoints.

## Roadmap

### Housekeeping

- Testing

### Enhancements

- GitHub actions for releases and such
- Dashboards, alarms, pipeline tests, etc.
- Migrate to monocdk (v2)

## Troubleshooting

Well, this isn't helpful.

## Development

This project leverages [Rush][4] to manage its monorepo. You'll need to install Rush globally to get started.

```bash
npm install -g @microsoft/rush
```

[4]: https://rushjs.io/

### Common Commands

`rush update` - Installs all dependencies for the monorepo

`rush rebuild` - Does a full, clean build of every project
(run `rush build` to build only the projects that have changed)

`rush add -p PACKAGE` - Adds the specified package as a dependency of the current project
(use `--dev` to make it a dev dependency)

`rush purge` - Deletes all temporary files created by Rush
(useful if you are having problems and suspect that cache files may be corrupt)