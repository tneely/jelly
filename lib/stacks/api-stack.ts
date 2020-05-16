import * as cdk from "@aws-cdk/core";

export interface ApiStackProps extends cdk.StackProps {}

export class ApiStack extends cdk.Stack {

  constructor(app: cdk.App, appName: string, props?: ApiStackProps) {
    super(app, `${appName}ApiStack`, props);

    // Set up API gateway to process user requests
    // TODO: Can the website define the API schema, and we import it here?
  }
}
