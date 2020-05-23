import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as cicd from "@aws-cdk/app-delivery";

export interface SelfUpdateStageProps {
  stack: cdk.Stack;
  input: codepipeline.Artifact;
}

export class SelfUpdateStage implements codepipeline.StageOptions {
  public readonly stageName: string;
  public readonly actions: codepipeline.IAction[];
  constructor(props: SelfUpdateStageProps) {
    const pipelineDeployAction = new cicd.PipelineDeployStackAction({
      stack: props.stack,
      input: props.input,
      adminPermissions: true,
    });

    this.stageName = "SelfUpdate";
    this.actions = [pipelineDeployAction];
  }
}
