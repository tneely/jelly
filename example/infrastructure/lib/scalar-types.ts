import { GraphqlType } from "aws-cdk-lib/lib/aws-appsync";

export const string = GraphqlType.string();
export const int = GraphqlType.int();
export const timestamp = GraphqlType.awsTimestamp();
