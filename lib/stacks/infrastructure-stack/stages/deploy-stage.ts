import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";

export interface DeployStageProps {}

export const DeployStage = (props: DeployStageProps): codepipeline.StageOptions => {
  return {
    stageName: "Deploy",
    actions: [],
  };
};
