import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import { InlineCodeFromFile } from "./inline-code-from-file";

export interface DistributionInvalidateActionProps
  extends codepipeline.CommonAwsActionProps {
  readonly distributionId: string;
}

export class DistributionInvalidateAction extends codepipeline_actions.LambdaInvokeAction {
  constructor(scope: cdk.Construct, props: DistributionInvalidateActionProps) {
    const invalidateLambda = new lambda.SingletonFunction(
      scope,
      "InvalidateFunction",
      {
        uuid: "cloudfront-distribution-invalidation-function",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        code: new InlineCodeFromFile("lambda/distribution-invalidate.ts"),
      }
    );

    invalidateLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["cloudfront:CreateInvalidation"],
        resources: ["*"],
      })
    );

    super({
      lambda: invalidateLambda,
      userParameters: {
        DISTRIBUTION_ID: props.distributionId,
      },
      ...props,
    });
  }
}
