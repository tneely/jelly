import * as cdk from "@aws-cdk/core";

export interface DataStackProps extends cdk.StackProps {}

export class DataStack extends cdk.Stack {

  constructor(app: cdk.App, appName: string, props?: DataStackProps) {
    super(app, `${appName}DataStack`, props);

    // Set up database to store user data
    // TODO: Can the website define the database schema, and we import it here?
  }
}
