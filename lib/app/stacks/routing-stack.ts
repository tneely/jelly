import * as cdk from "@aws-cdk/core";

export interface RoutingStackProps extends cdk.StackProps {}

/**
 * A CloudFormation stack for routing constructs
 */
export class RoutingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, appName: string, props?: RoutingStackProps) {
    super(scope, `${appName}RoutingStack`, props);

    // TODO: set up custom domain name, enable ssl
  }
}
