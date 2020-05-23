import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as cloudfront from "@aws-cdk/aws-cloudfront";

import { DistributionInvalidateAction } from "../../../constructs/distribution-invalidate-action";

export interface SiteUpdateStageProps {
  input: codepipeline.Artifact;
  bucket: s3.Bucket;
  distribution: cloudfront.CloudFrontWebDistribution;
}

export class SiteUpdateStage implements codepipeline.StageOptions {
  public readonly stageName: string;
  public readonly actions: codepipeline.IAction[];
  constructor(scope: cdk.Construct, props: SiteUpdateStageProps) {
    const siteDeployAction = new codepipeline_actions.S3DeployAction({
      actionName: "Update_Bucket",
      runOrder: 1,
      input: props.input,
      bucket: props.bucket,
    });
    const cdnInvalidateAction = new DistributionInvalidateAction(scope, {
      actionName: "Invalidate_Distribution",
      runOrder: 2,
      distributionId: props.distribution.distributionId,
    });

    this.stageName = "SiteUpdate";
    this.actions = [siteDeployAction, cdnInvalidateAction];
  }
}
