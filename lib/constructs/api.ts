import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as apig from "@aws-cdk/aws-apigateway";
import * as codedeploy from "@aws-cdk/aws-codedeploy";
import * as routeAlias from "@aws-cdk/aws-route53-targets";
import * as route53 from "@aws-cdk/aws-route53";
import { Authentication } from ".";
import { Routing } from "./routing";
import * as path from "path";

export interface ApiProps {
  /**
   * Database to use
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
   * Bucket containing the handler code
   */
  apiBucket: s3.IBucket;
  /**
   * Bucket key containing the handler code
   */
  apiBucketKey: string;
  /**
   * Domain name to use for the API
   */
  domainName?: string;
  /**
   * The root hosted zone for the domain name
   */
  rootHostedZone?: route53.HostedZone;
  auth: Authentication;
}

/**
 * A CloudFormation stack for API constructs
 * TODO: import model?, break up into stacks if resource count gets too high
 */
export class Api extends cdk.Construct {
  public readonly restApi: apig.RestApi;
  public readonly handler: lambda.Function;
  public readonly routing?: Routing;

  constructor(scope: cdk.Construct, props: ApiProps) {
    super(scope, "Api");

    const handlerName = props.handlerName || "index.handler";

    this.handler = new lambda.Function(this, "ApiHandler", {
      handler: handlerName,
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromBucket(props.apiBucket, props.apiBucketKey),
      environment: {
        DATABASE_NAME: props.database.tableName,
      },
    });
    props.database.grantFullAccess(this.handler);

    const alias = new lambda.Alias(this, "ApiAlias", {
      aliasName: "Prod",
      version: this.handler.currentVersion,
    });

    new codedeploy.LambdaDeploymentGroup(this, "ApiDeploymentGroup", {
      alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
    });

    this.restApi = new apig.RestApi(this, "Api");
    const api = this.restApi.root.addResource("api");
    api.addProxy({
      defaultIntegration: new apig.LambdaIntegration(this.handler),
    });

    if (props.domainName) {
      this.routing = new Routing(this, {
        domainName: props.domainName,
        rootHostedZone: props.rootHostedZone,
      });

      this.restApi.addDomainName("CustomDomain", {
        domainName: props.domainName,
        certificate: this.routing.certificate,
      });

      this.routing.addAliasTarget(new routeAlias.ApiGateway(this.restApi));
    }

    const authHandler = new lambda.Function(this, "AuthHandler", {
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda/authentication")),
      environment: {
        USER_POOL_ID: props.auth.userPool.userPoolId,
        USER_POOL_CLIENT_ID: props.auth.userPoolClient.userPoolClientId,
      },
    });
    const auth = this.restApi.root.addResource("auth");
    auth.addMethod("ANY", new apig.LambdaIntegration(authHandler));
  }
}
