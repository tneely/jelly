import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as apig from "@aws-cdk/aws-apigateway";
import * as codedeploy from "@aws-cdk/aws-codedeploy";
import * as routeAlias from "@aws-cdk/aws-route53-targets";
import { Routing } from "./routing";

export interface ApiProps {
  /**
   * The database table to be made available to the lambda
   */
  database: dynamodb.Table;

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
   * The lambda code to deploy
   */
  code: lambda.Code;

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
  authHandler: lambda.Function;
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
        DATABASE_NAME: props.database.tableName,
        AUTH_LAMBDA_ARN: props.authHandler.functionArn,
      },
    });
    props.database.grantFullAccess(this.handler);
    props.authHandler.grantInvoke(this.handler);

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
}
