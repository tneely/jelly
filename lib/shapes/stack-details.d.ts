import * as cdk from "@aws-cdk/core";

export interface StackDetails {
  stack: cdk.Stack;
  priority?: number;
}
