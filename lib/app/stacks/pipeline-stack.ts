import * as cdk from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as cognito from "@aws-cdk/aws-cognito";
import * as s3 from "@aws-cdk/aws-s3";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

import { DistributionInvalidateAction } from "../constructs/distribution-invalidate-action";

export interface PipelineStackProps extends cdk.StackProps {
  // TODO: Make github its own interface, maybe give it a better name
  github: {
    owner: string;
    repo: string;
    key: string;
  };
  siteBucket: s3.Bucket;
  distribution: cloudfront.CloudFrontWebDistribution;
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  database: dynamodb.Table;
  apiBucket: s3.Bucket;
}

/**
 * A CloudFormation stack for pipeline constructs
 */
export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, appName: string, props: PipelineStackProps) {
    super(scope, `${appName}PipelineStack`, props);

    const appBuild = new codebuild.PipelineProject(this, "AppBuild");
    const siteOutput = new codepipeline.Artifact("SiteBuildOutput");
    const apiOutput = new codepipeline.Artifact("ApiBuildOutput");

    const sourceOutput = new codepipeline.Artifact();

    new codepipeline.Pipeline(this, "Pipeline", {
      stages: [
        {
          stageName: "Source",
          actions: [
            new codepipeline_actions.GitHubSourceAction({
              actionName: "GitHub_Source",
              owner: props.github.owner,
              repo: props.github.repo,
              output: sourceOutput,
              oauthToken: new cdk.SecretValue(props.github.key),
            }),
          ],
        },
        {
          stageName: "Build",
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: "App_Build",
              project: appBuild,
              input: sourceOutput,
              // TODO: Update app buildspec for multiple outputs
              // https://docs.aws.amazon.com/codebuild/latest/userguide/sample-multi-in-out.html
              outputs: [siteOutput, apiOutput],
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
            new codepipeline_actions.S3DeployAction({
              actionName: "Api_Deploy",
              runOrder: 1,
              input: apiOutput,
              bucket: props.apiBucket,
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
