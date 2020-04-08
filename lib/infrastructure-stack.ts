import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda-nodejs";
import * as apigw from "@aws-cdk/aws-apigateway";

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hello = new lambda.NodejsFunction(this, "HelloFunction", {
      entry: "lambda/hello.ts",
      handler: "handler",
    });

    new apigw.LambdaRestApi(this, "Endpoint", {
      handler: hello,
    });
  }
}
