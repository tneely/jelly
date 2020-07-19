import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as cloudfront from "@aws-cdk/aws-cloudfront";

import { DistributionInvalidateAction } from "../../";

export interface DeployStageProps {
  deploymentTargets: {
    [target: string]: {
      input: codepipeline.Artifact;
      bucket: s3.Bucket;
    };
  };
  distribution: cloudfront.CloudFrontWebDistribution;
}

export class DeployStage implements codepipeline.StageOptions {
  public readonly stageName: string;
  public readonly actions: codepipeline.IAction[];
  constructor(scope: cdk.Construct, props: DeployStageProps) {
    const deployActions = Object.keys(props.deploymentTargets).map(
      (targetName) =>
        new codepipeline_actions.S3DeployAction({
          actionName: `Update_${targetName}_Bucket`,
          runOrder: 1,
          input: props.deploymentTargets[targetName].input,
          bucket: props.deploymentTargets[targetName].bucket,
        })
    );
    const cdnInvalidateAction = new DistributionInvalidateAction(scope, {
      actionName: "Invalidate_Distribution",
      runOrder: 2,
      distributionId: props.distribution.distributionId,
    });

    this.stageName = "SiteUpdate";
    this.actions = [...deployActions, cdnInvalidateAction];
  }
}
