import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as codebuild from "@aws-cdk/aws-codebuild";

export interface BuildStageProps {
  project: codebuild.Project;
  input: codepipeline.Artifact;
  outputs: codepipeline.Artifact[];
}

export const BuildStage = (props: BuildStageProps): codepipeline.StageOptions => {
  const cdkBuildAction = new codepipeline_actions.CodeBuildAction({
    actionName: "Cdk_Build",
    project: props.project,
    input: props.input,
    outputs: props.outputs,
  });

  return {
    stageName: "Build",
    actions: [cdkBuildAction],
  };
};
