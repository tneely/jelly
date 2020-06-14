import * as cdk from "@aws-cdk/core";
import * as route53 from "@aws-cdk/aws-route53";

export interface RoutingStackProps extends cdk.StackProps {}

/**
 * A CloudFormation stack for routing constructs
 */
export class RoutingStack extends cdk.Stack {
  private readonly hostedZone: route53.HostedZone;
  constructor(scope: cdk.Construct, props?: RoutingStackProps) {
    super(scope, "RoutingStack", props);

    this.hostedZone = new route53.HostedZone(this, "Placeholder", {
      zoneName: "placeholder.com",
    });
    // TODO: set up custom domain name, enable ssl
  }
}
