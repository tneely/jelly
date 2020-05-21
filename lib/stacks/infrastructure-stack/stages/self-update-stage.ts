import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as cicd from "@aws-cdk/app-delivery";

export interface SelfUpdateStageProps {
  stack: cdk.Stack;
  input: codepipeline.Artifact;
}

export const SelfUpdateStage = (props: SelfUpdateStageProps): codepipeline.StageOptions => {
  const pipelineDeployAction = new cicd.PipelineDeployStackAction({
    stack: props.stack,
    input: props.input,
    adminPermissions: true,
  });

  return {
    stageName: "SelfUpdate",
    actions: [pipelineDeployAction],
  };
};
