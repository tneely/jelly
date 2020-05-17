import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { AttributeType } from "@aws-cdk/aws-dynamodb";

export interface DataStackProps extends cdk.StackProps {}

/**
 * A CloudFormation stack for data constructs
 */
export class DataStack extends cdk.Stack {
  public readonly table: dynamodb.Table;

  constructor(app: cdk.App, appName: string, props?: DataStackProps) {
    super(app, `${appName}DataStack`, props);

    this.table = new dynamodb.Table(this, "TestTable", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
    });
  }
}
