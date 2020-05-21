import * as cdk from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import { BuildStage, DeployStage, SelfUpdateStage, SourceStage } from "./stages";
import { GithubDetails } from "../../shapes/github-details";
import { StackDetails } from "../../shapes/stack-details";

export interface PipelineStackProps extends cdk.StackProps {
  github: GithubDetails;
  appStacks: StackDetails[];
}

/**
 * A CloudFormation stack for pipeline constructs
 */
export class InfrastructurePipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, appName: string, props: PipelineStackProps) {
    super(scope, `${appName}InfrastructurePipelineStack`, props);

    const pipeline = new codepipeline.Pipeline(this, "Pipeline", {
      restartExecutionOnUpdate: true,
    });

    const cdkSourceOutput = new codepipeline.Artifact("CdkSourceOutput");

    pipeline.addStage(
      SourceStage({
        output: cdkSourceOutput,
        github: props.github,
      })
    );

    const cdkProject = new codebuild.PipelineProject(this, `${appName}Infrastructure`);
    const cdkBuildOutput = new codepipeline.Artifact("CdkBuildOutput");

    pipeline.addStage(
      BuildStage({
        project: cdkProject,
        input: cdkSourceOutput,
        outputs: [cdkBuildOutput],
        apiKey: props.github.key,
      })
    );

    pipeline.addStage(
      SelfUpdateStage({
        stack: this,
        input: cdkBuildOutput,
      })
    );

    pipeline.addStage(
      DeployStage({
        input: cdkBuildOutput,
        appStacks: props.appStacks,
      })
    );
  }
}
