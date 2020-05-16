import * as cdk from "@aws-cdk/core";

export interface RoutingStackProps extends cdk.StackProps {}

export class RoutingStack extends cdk.Stack {
  constructor(app: cdk.App, appName: string, props?: RoutingStackProps) {
    super(app, `${appName}RoutingStack`, props);

    // TODO: set up custom domain name, enable ssl
  }
}
