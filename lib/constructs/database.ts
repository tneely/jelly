import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { AttributeType } from "@aws-cdk/aws-dynamodb";

export interface DatabaseProps {}

/**
 * A CloudFormation stack for data constructs
 */
export class Database extends cdk.Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: cdk.Construct) {
    super(scope, "Database");

    this.table = new dynamodb.Table(this, "Primary", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
    });

    // TODO: Generate tables from API schema?
  }
}
