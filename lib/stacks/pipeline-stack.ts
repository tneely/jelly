import * as cdk from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as cognito from "@aws-cdk/aws-cognito";
import * as s3 from "@aws-cdk/aws-s3";

import * as config from "../../config/app-config.json";
import * as secrets from "../../config/secrets.json";
import { DistributionInvalidateAction } from "../constructs/distribution-invalidate-action";

export interface PipelineStackProps extends cdk.StackProps {
  readonly siteBucket: s3.Bucket;
  readonly distribution: cloudfront.CloudFrontWebDistribution;
  readonly userPool: cognito.UserPool;
  readonly userPoolClient: cognito.UserPoolClient;
}

/**
 * A CloudFormation stack for pipeline constructs
 */
export class PipelineStack extends cdk.Stack {
  constructor(app: cdk.App, appName: string, props: PipelineStackProps) {
    super(app, `${appName}PipelineStack`, props);

    const siteBuild = new codebuild.PipelineProject(this, "SiteBuild");
    const siteOutput = new codepipeline.Artifact("SiteBuildOutput");

    const sourceOutput = new codepipeline.Artifact();

    new codepipeline.Pipeline(this, "Pipeline", {
      stages: [
        {
          stageName: "Source",
          actions: [
            new codepipeline_actions.GitHubSourceAction({
              actionName: "GitHub_Source",
              owner: config.github.owner,
              repo: config.github.repo,
              output: sourceOutput,
              oauthToken: new cdk.SecretValue(secrets.githubKey),
            }),
          ],
        },
        {
          stageName: "Build",
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: "Site_Build",
              project: siteBuild,
              input: sourceOutput,
              outputs: [siteOutput],
              environmentVariables: {
                REACT_APP_AWS_REGION: {
                  type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                  value: this.region,
                },
                REACT_APP_USER_POOL_ID: {
                  type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                  value: props.userPool.userPoolId,
                },
                REACT_APP_USER_POOL_CLIENT_ID: {
                  type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                  value: props.userPoolClient.userPoolClientId,
                },
                REACT_APP_API_INVOKE_URL: {
                  type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                  value: "placeholder",
                },
              },
            }),
          ],
        },
        {
          stageName: "Deploy",
          actions: [
            new codepipeline_actions.S3DeployAction({
              actionName: "Site_Deploy",
              runOrder: 1,
              input: siteOutput,
              bucket: props.siteBucket,
            }),
            new DistributionInvalidateAction(this, {
              actionName: "Invalidate_Distribution",
              runOrder: 2,
              distributionId: props.distribution.distributionId,
            }),
          ],
        },
      ],
    });
  }
}
