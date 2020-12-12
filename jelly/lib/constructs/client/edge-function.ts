import { Construct } from "aws-cdk-lib";
import { EdgeLambda, LambdaEdgeEventType } from "aws-cdk-lib/lib/aws-cloudfront";
import { Role, CompositePrincipal, ServicePrincipal, ManagedPolicy } from "aws-cdk-lib/lib/aws-iam";
import { FunctionProps, IVersion, Function } from "aws-cdk-lib/lib/aws-lambda";

export interface EdgeFunctionProps extends Omit<FunctionProps, "environment" | "role"> {
  /**
   * The type of event in response to which should the function be invoked
   */
  eventType: LambdaEdgeEventType;
}

export class EdgeFunction extends Construct implements EdgeLambda {
  public readonly functionVersion: IVersion;
  public readonly eventType: LambdaEdgeEventType;

  constructor(scope: Construct, id: string, props: EdgeFunctionProps) {
    super(scope, id);

    const handler = new Function(this, "Resource", {
      ...props,
      role: new Role(scope, "EdgeRole", {
        assumedBy: new CompositePrincipal(
          new ServicePrincipal("lambda.amazonaws.com"),
          new ServicePrincipal("edgelambda.amazonaws.com")
        ),
        managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")],
      }),
    });

    this.functionVersion = handler.currentVersion;
    this.eventType = props.eventType;
  }
}
