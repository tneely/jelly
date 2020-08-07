import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { AttributeType } from "@aws-cdk/aws-dynamodb";

export interface DatabaseProps {}

/**
 * A Construct to create the application's databases
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
      sortKey: {
        name: "created",
        type: AttributeType.NUMBER,
      },
      timeToLiveAttribute: "ttl",
    });
  }
}
