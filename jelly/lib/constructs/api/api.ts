import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apig from "@aws-cdk/aws-apigateway";
import * as codedeploy from "@aws-cdk/aws-codedeploy";
import * as routeAlias from "@aws-cdk/aws-route53-targets";
import { Routing } from "../routing";
import { Database } from "../database";

export interface ApiOptions {
  /**
   * The lambda code to deploy
   */
  code: lambda.Code;

  /**
   * Name of the lambda handler
   *
   * @default "index.handler"
   */
  handlerName?: string;

  /**
   * Runtime to use for the lambda code
   *
   * @default lambda.Runtime.NODEJS_12_X
   */
  handlerRuntime?: lambda.Runtime;

  /**
   * Key-value pairs that Lambda caches and makes available for your Lambda
   * functions. Use environment variables to apply configuration changes, such
   * as test and production environment configurations, without changing your
   * Lambda function source code.
   *
   * By default, Jelly makes the following environment variables available to your Lambda:
   * - [DATABASE_NAMES]: the database tables corresponding to keys in JellyProps.Database.tables
   * - AUTH_LAMBDA_ARN: the name of a lambda that can be used to authenticate users
   * - AWS_NODEJS_CONNECTION_REUSE_ENABLED: enables connection reuse in Node.js functions
   *
   * @default - No additional environment variables.
   */
  environmentVariables?: {
    [key: string]: string;
  };
}

export interface ApiProps extends ApiOptions {
  /**
   * The database tables to be made available to the lambda
   */
  database: Database;

  /**
   * Routing to use for custom domains
   *
   * If present, the RestApi will be aliased to the API domain name
   *
   * @default - The API will not use a custom domain name
   */
  routing?: Routing;

  /**
   * Lambda responsible for authenticating Cognito user JWTs
   */
  authHandler?: lambda.Function;
}

/**
 * A Construct to create and deploy the application's API
 */
export class Api extends cdk.Construct {
  public readonly restApi: apig.RestApi;
  public readonly handler: lambda.Function;

  constructor(scope: cdk.Construct, props: ApiProps) {
    super(scope, "Api");

    const handlerName = props.handlerName || "index.handler";
    const handlerRuntime = props.handlerRuntime || lambda.Runtime.NODEJS_12_X;

    this.handler = new lambda.Function(this, "ApiHandler", {
      handler: handlerName,
      runtime: handlerRuntime,
      code: props.code,
      environment: {
        ...props.environmentVariables,
        ...this.renderDatabaseVariables(props.database),
        ...this.renderAuthVariables(props.authHandler),
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      },
    });
    this.grantDatabaseAccess(this.handler, props.database);
    props.authHandler?.grantInvoke(this.handler);

    const alias = new lambda.Alias(this, "Alias", {
      aliasName: "Prod",
      version: this.handler.currentVersion,
    });

    new codedeploy.LambdaDeploymentGroup(this, "DeploymentGroup", {
      alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
    });

    this.restApi = new apig.RestApi(this, "RestApi");
    this.restApi.root.addProxy({
      defaultIntegration: new apig.LambdaIntegration(this.handler),
    });

    if (props.routing) {
      this.restApi.addDomainName("CustomDomain", {
        domainName: props.routing.apiDomain.name,
        certificate: props.routing.rootDomain.certificate,
      });
      props.routing.apiDomain.addAliasTarget(new routeAlias.ApiGateway(this.restApi));
    }
  }

  private renderDatabaseVariables(database: Database): Record<string, string> {
    if (database.tables) {
      const databaseNames = Object.keys(database.tables).reduce((databaseNames, tableKey) => {
        const table = database.tables![tableKey];
        databaseNames[tableKey] = table.tableName;
        return databaseNames;
      }, {} as Record<string, string>);

      return databaseNames;
    } else {
      return {};
    }
  }

  private renderAuthVariables(authHandler?: lambda.Function): Record<string, string> {
    return authHandler ? { AUTH_LAMBDA_ARN: authHandler.functionArn } : {};
  }

  private grantDatabaseAccess(handler: lambda.Function, database: Database): void {
    if (database.tables) {
      Object.keys(database.tables).forEach((tableKey) => {
        database.tables![tableKey].grantFullAccess(handler);
      });
    }
  }
}
