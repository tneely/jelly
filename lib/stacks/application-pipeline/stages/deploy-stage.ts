import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as cloudfront from "@aws-cdk/aws-cloudfront";

import { DistributionInvalidateAction } from "../../../constructs/distribution-invalidate-action";

export interface DeployStageProps {
  site: {
    input: codepipeline.Artifact;
    bucket: s3.Bucket;
  };
  api: {
    input: codepipeline.Artifact;
    bucket: s3.Bucket;
  };
  distribution: cloudfront.CloudFrontWebDistribution;
}

export const DeployStage = (
  scope: cdk.Construct,
  props: DeployStageProps
): codepipeline.StageOptions => {
  const siteDeployAction = new codepipeline_actions.S3DeployAction({
    actionName: "Site_Deploy",
    runOrder: 1,
    input: props.site.input,
    bucket: props.site.bucket,
  });
  const apiDeployAction = new codepipeline_actions.S3DeployAction({
    actionName: "Api_Deploy",
    runOrder: 1,
    input: props.api.input,
    bucket: props.api.bucket,
  });
  const cdnInvalidateAction = new DistributionInvalidateAction(scope, {
    actionName: "Invalidate_Distribution",
    runOrder: 2,
    distributionId: props.distribution.distributionId,
  });

  return {
    stageName: "Deploy",
    actions: [siteDeployAction, apiDeployAction, cdnInvalidateAction],
  };
};
