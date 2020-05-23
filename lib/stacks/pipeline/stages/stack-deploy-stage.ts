import * as cdk from "@aws-cdk/core";
import * as cicd from "@aws-cdk/app-delivery";
import * as codepipeline from "@aws-cdk/aws-codepipeline";

export interface StackDeployStageProps {
  input: codepipeline.Artifact;
  stacks: cdk.Stack[];
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
      });

      // Rename actions to allow deployment of multiple stacks
      // https://github.com/aws/aws-cdk/issues/3984
      (action as any).prepareChangeSetAction.actionProperties.actionName = `ChangeSet_${stack.stackName}`;
      (action as any).executeChangeSetAction.actionProperties.actionName = `Execute_${stack.stackName}`;

      return action;
    });
  }
}
