import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";
import * as cloudfront from "@aws-cdk/aws-cloudfront";

export interface EdgeFunctionProps extends Omit<lambda.FunctionProps, "environment" | "role"> {
  /**
   * The type of event in response to which should the function be invoked
   */
  eventType: cloudfront.LambdaEdgeEventType;
}

export class EdgeFunction extends cdk.Construct implements cloudfront.EdgeLambda {
  public readonly functionVersion: lambda.IVersion;
  public readonly eventType: cloudfront.LambdaEdgeEventType;

  constructor(scope: cdk.Construct, id: string, props: EdgeFunctionProps) {
    super(scope, id);

    const handler = new lambda.Function(this, "Resource", {
      ...props,
      role: new iam.Role(scope, "EdgeRole", {
        assumedBy: new iam.CompositePrincipal(
          new iam.ServicePrincipal("lambda.amazonaws.com"),
          new iam.ServicePrincipal("edgelambda.amazonaws.com")
        ),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
        ],
      }),
    });

    this.functionVersion = handler.currentVersion;
    this.eventType = props.eventType;
  }
}
