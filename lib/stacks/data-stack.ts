import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { AttributeType } from "@aws-cdk/aws-dynamodb";

export interface DataStackProps extends cdk.StackProps {}

/**
 * A CloudFormation stack for data constructs
 */
export class DataStack extends cdk.Stack {
  public readonly table: dynamodb.Table;

  constructor(scope: cdk.Construct, props?: DataStackProps) {
    super(scope, "DataStack", props);

    this.table = new dynamodb.Table(this, "Primary", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
    });

    // TODO: Generate tables from API schema?
  }
}
