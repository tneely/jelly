import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as api_gateway from "@aws-cdk/aws-apigatewayv2";
import * as codedeploy from "@aws-cdk/aws-codedeploy";

export interface ApiStackProps extends cdk.StackProps {
  /**
   * The API Gateway to use
   */
  apiGateway: api_gateway.HttpApi;
  /**
   * The database to use
   */
  database: dynamodb.Table;
  /**
   * Name of the lambda handler
   *
   * @default "index.handler"
   */
  handlerName?: string;
  /**
   * The runtime to use for the lambda code
   *
   * @default lambda.Runtime.NODEJS_12_X
   */
  handlerRuntime?: lambda.Runtime;
}

/**
 * A CloudFormation stack for API constructs
 */
export class ApiStack extends cdk.Stack {
  public readonly lambdaCode: lambda.CfnParametersCode;

  constructor(scope: cdk.Construct, props: ApiStackProps) {
    super(scope, "AppStack", props);

    const handlerName = props.handlerName || "index.handler";
    this.lambdaCode = lambda.Code.fromCfnParameters();

    const handler = new lambda.Function(this, "ApiHandler", {
      handler: handlerName,
      runtime: lambda.Runtime.NODEJS_12_X,
      code: this.lambdaCode,
      environment: {
        DATABASE_NAME: props.database.tableName,
      },
    });
    // TODO: Restrict permissions?
    props.database.grantFullAccess(handler);

    const version = handler.addVersion(new Date().toISOString());
    const alias = new lambda.Alias(this, "ApiAlias", {
      aliasName: "Prod",
      version,
    });
    new codedeploy.LambdaDeploymentGroup(this, "ApiDeploymentGroup", {
      alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
    });

    new api_gateway.HttpRoute(this, "DefaultRoute", {
      httpApi: props.apiGateway,
      routeKey: api_gateway.HttpRouteKey.DEFAULT,
      integration: new api_gateway.LambdaProxyIntegration({
        handler: handler,
      }),
    });
  }
}
