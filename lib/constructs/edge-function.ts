import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";
import * as cloudfront from "@aws-cdk/aws-cloudfront";

export interface EdgeFunctionProps extends Omit<lambda.FunctionProps, "environment"> {
  /**
   * The type of event in response to which should the function be invoked
   */
  eventType: cloudfront.LambdaEdgeEventType;
}

export class EdgeFunction extends lambda.Function implements cloudfront.EdgeLambda {
  public readonly functionVersion: lambda.IVersion;
  public readonly eventType: cloudfront.LambdaEdgeEventType;

  constructor(scope: cdk.Construct, id: string, props: EdgeFunctionProps) {
    super(scope, id, props);

    this.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["sts:AssumeRole"],
        principals: [
          new iam.ServicePrincipal("lambda.amazonaws.com"),
          new iam.ServicePrincipal("edgelambda.amazonaws.com"),
        ],
      })
    );

    this.functionVersion = this.currentVersion;
    this.eventType = props.eventType;
  }
}
