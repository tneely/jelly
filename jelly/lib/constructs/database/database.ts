import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export interface DatabaseOptions {
  /**
   * A list of DynamoDB tables to create, along with their configuration
   *
   * @default - No tables are created
   */
  tables?: {
    [key: string]: dynamodb.TableProps;
  };
}

export interface DatabaseProps extends DatabaseOptions {}

/**
 * A Construct to create the application's databases
 */
export class Database extends cdk.Construct {
  public readonly tables?: Record<string, dynamodb.Table>;

  constructor(scope: cdk.Construct, props?: DatabaseProps) {
    super(scope, "Database");

    if (props?.tables) {
      this.tables = Object.keys(props.tables).reduce((tables, tableKey) => {
        const tableProps = props.tables![tableKey];
        tables[tableKey] = new dynamodb.Table(this, tableKey, tableProps);
        return tables;
      }, {} as Record<string, dynamodb.Table>);
    }
  }
}
