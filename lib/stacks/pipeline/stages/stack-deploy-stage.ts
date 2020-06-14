import * as cdk from "@aws-cdk/core";
import * as cicd from "@aws-cdk/app-delivery";
import * as codepipeline from "@aws-cdk/aws-codepipeline";

export interface StackDeployStageProps {
  readonly input: codepipeline.Artifact;
  readonly stacks: readonly cdk.Stack[];
}

export class StackDeployStage implements codepipeline.StageOptions {
  public readonly stageName: string;
  public readonly actions: codepipeline.IAction[];
  constructor(props: StackDeployStageProps) {
    this.stageName = "StackDeploy";
    this.actions = props.stacks.map((stack) => {
      const action = new cicd.PipelineDeployStackAction({
        stack: stack,
        input: props.input,
        adminPermissions: true,
        createChangeSetActionName: `ChangeSet_${stack.stackName}`,
        executeChangeSetActionName: `Execute_${stack.stackName}`,
      });

      return action;
    });
  }
}
