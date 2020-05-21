import * as cdk from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import { BuildStage, DeployStage, SelfUpdateStage, SourceStage } from "./stages";
import { GithubDetails } from "../../shapes/github-details";

export interface PipelineStackProps extends cdk.StackProps {
  github: GithubDetails;
}

/**
 * A CloudFormation stack for pipeline constructs
 */
export class InfrastructurePipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, appName: string, props: PipelineStackProps) {
    super(scope, `${appName}PipelineStack`, props);

    const pipeline = new codepipeline.Pipeline(this, "Pipeline", {
      restartExecutionOnUpdate: true,
    });

    const jellySourceOutput = new codepipeline.Artifact("CdkSourceOutput");

    pipeline.addStage(
      SourceStage({
        output: jellySourceOutput,
        github: props.github,
      })
    );

    const jellyProject = new codebuild.PipelineProject(this, "JellyProject");
    const jellyBuildOutput = new codepipeline.Artifact("JellyBuildOutput");

    pipeline.addStage(
      BuildStage({
        project: jellyProject,
        input: jellySourceOutput,
        outputs: [jellyBuildOutput],
      })
    );

    pipeline.addStage(
      SelfUpdateStage({
        stack: this,
        input: jellyBuildOutput,
      })
    );

    pipeline.addStage(DeployStage({}));
  }
}
