import * as cdk from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as cognito from "@aws-cdk/aws-cognito";
import * as s3 from "@aws-cdk/aws-s3";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { BuildStage, DeployStage, SourceStage } from "./stages";
import { GithubDetails } from "../../shapes/github-details";

export interface PipelineStackProps extends cdk.StackProps {
  github: GithubDetails;
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
export class ApplicationPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, appName: string, props: PipelineStackProps) {
    super(scope, `${appName}PipelineStack`, props);

    const pipeline = new codepipeline.Pipeline(this, "Pipeline", {
      restartExecutionOnUpdate: true,
    });

    const appSourceOutput = new codepipeline.Artifact("AppSourceOutput");

    pipeline.addStage(
      SourceStage({
        output: appSourceOutput,
        github: props.github,
      })
    );

    const appProject = new codebuild.PipelineProject(this, "AppProject");
    const siteBuildOutput = new codepipeline.Artifact("SiteBuildOutput");
    const apiBuildOutput = new codepipeline.Artifact("ApiBuildOutput");

    pipeline.addStage(
      BuildStage({
        project: appProject,
        input: appSourceOutput,
        outputs: [siteBuildOutput, apiBuildOutput],
        env: {
          region: this.region,
          userPool: props.userPool,
          userPoolClient: props.userPoolClient,
          apiInvokeUrl: "placeholder",
        },
      })
    );

    pipeline.addStage(
      DeployStage(this, {
        site: {
          input: siteBuildOutput,
          bucket: props.siteBucket,
        },
        api: {
          input: apiBuildOutput,
          bucket: props.apiBucket,
        },
        distribution: props.distribution,
      })
    );
  }
}
