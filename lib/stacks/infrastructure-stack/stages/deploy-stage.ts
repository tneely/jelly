import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as cicd from "@aws-cdk/app-delivery";
import { StackDetails } from "../../../shapes/stack-details";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";

export interface DeployStageProps {
  input: codepipeline.Artifact;
  appStacks: StackDetails[];
}

export const DeployStage = (props: DeployStageProps): codepipeline.StageOptions => {
  const stackDeployActions = props.appStacks.map((stackDetails) => {
    const action = new cicd.PipelineDeployStackAction({
      stack: stackDetails.stack,
      input: props.input,
      adminPermissions: true,
      createChangeSetRunOrder: stackDetails.priority,
    });

    // Rename actions to allow deployment of multiple stacks
    // https://github.com/aws/aws-cdk/issues/3984
    (action as any).prepareChangeSetAction.actionProperties.actionName = `ChangeSet_${stackDetails.stack.stackName}`;
    (action as any).executeChangeSetAction.actionProperties.actionName = `Execute_${stackDetails.stack.stackName}`;

    return action;
  });

  return {
    stageName: "Deploy",
    actions: stackDeployActions,
  };
};
