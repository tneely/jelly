import * as cdk from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as s3 from "@aws-cdk/aws-s3";
import * as cloudfront from "@aws-cdk/aws-cloudfront";

import { BuildStage, SourceStage, DeployStage } from "./stages";
import { RepositoryDetails } from "../../model/repository-details";

export interface PipelineProps {
  readonly appName: string;
  readonly apiKey: string;
  readonly appRepo: RepositoryDetails;
  readonly apiBucket: s3.Bucket;
  readonly siteBucket: s3.Bucket;
  readonly distribution: cloudfront.CloudFrontWebDistribution;
}

/**
 * A CloudFormation stack for pipeline constructs
 */
export class Pipeline extends cdk.Construct {
  constructor(scope: cdk.Construct, props: PipelineProps) {
    super(scope, "Pipeline");

    const pipeline = new codepipeline.Pipeline(this, "Pipeline", {
      restartExecutionOnUpdate: true,
    });

    const appSourceOutput = new codepipeline.Artifact("AppSourceOutput");
    pipeline.addStage(
      new SourceStage({
        apiKey: props.apiKey,
        sources: {
          App: {
            output: appSourceOutput,
            github: props.appRepo,
          },
        },
      })
    );

    const appProject = new codebuild.PipelineProject(this, `${props.appName}-App`);
    const apiBuildOutput = new codepipeline.Artifact("ApiBuildOutput");
    const siteBuildOutput = new codepipeline.Artifact("SiteBuildOutput");
    pipeline.addStage(
      new BuildStage({
        project: appProject,
        input: appSourceOutput,
        // TODO: Build site and api separately (ie different repos)?
        outputs: [siteBuildOutput, apiBuildOutput],
      })
    );

    pipeline.addStage(
      new DeployStage(this, {
        deploymentTargets: {
          Site: {
            input: siteBuildOutput,
            bucket: props.siteBucket,
          },
          Api: {
            input: apiBuildOutput,
            bucket: props.apiBucket,
          },
        },
        distribution: props.distribution,
      })
    );
  }
}
