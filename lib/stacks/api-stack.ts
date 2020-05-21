import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as api_gateway from "@aws-cdk/aws-apigatewayv2";

export interface ApiStackProps extends cdk.StackProps {
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
  private readonly api: api_gateway.HttpApi;
  private readonly handler: lambda.Function;
  public readonly handlerCodeBucket: s3.Bucket;

  constructor(scope: cdk.Construct, appName: string, props: ApiStackProps) {
    super(scope, `${appName}ApiStack`, props);

    const handlerName = props.handlerName || "index.handler";

    // Set up bucket to host custom lambda code
    this.handlerCodeBucket = new s3.Bucket(this, "ApiHandlerCode");

    // Set up API gateway to process user requests
    this.handler = new lambda.Function(this, "ApiHandler", {
      handler: handlerName,
      runtime: lambda.Runtime.NODEJS_12_X,
      code: new lambda.S3Code(this.handlerCodeBucket, "index.js"),
      environment: {
        DATABASE_NAME: props.database.tableName,
      },
    });
    // TODO: Restrict permissions?
    props.database.grantFullAccess(this.handler);

    this.api = new api_gateway.HttpApi(this, `${appName}Api`, {
      defaultIntegration: new api_gateway.LambdaProxyIntegration({
        handler: this.handler,
      }),
    });
  }
}
