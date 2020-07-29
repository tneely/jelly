import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as apig from "@aws-cdk/aws-apigateway";
import * as codedeploy from "@aws-cdk/aws-codedeploy";
import * as routeAlias from "@aws-cdk/aws-route53-targets";
import { Authentication } from ".";
import { Routing } from "./routing";

export interface ApiProps {
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
  bucket: s3.IBucket;
  bucketKey: string;
  routing?: Routing;
  auth: Authentication;
}

/**
 * A CloudFormation stack for API constructs
 */
export class Api extends cdk.Construct {
  public readonly restApi: apig.RestApi;
  public readonly handler: lambda.Function;

  constructor(scope: cdk.Construct, props: ApiProps) {
    super(scope, "Api");

    const handlerName = props.handlerName || "index.handler";
    const handlerRuntime = props.handlerRuntime || lambda.Runtime.NODEJS_12_X;

    this.handler = new lambda.Function(this, "AppHandler", {
      handler: handlerName,
      runtime: handlerRuntime,
      code: lambda.Code.fromBucket(props.bucket, props.bucketKey),
      environment: {
        DATABASE_NAME: props.database.tableName,
      },
    });
    props.database.grantFullAccess(this.handler);

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
