import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as codebuild from "@aws-cdk/aws-codebuild";

export interface BuildStageProps {
  project: codebuild.Project;
  input: codepipeline.Artifact;
  outputs: codepipeline.Artifact[];
  apiKey: string;
}

export const BuildStage = (props: BuildStageProps): codepipeline.StageOptions => {
  const apiKeySecret = new cdk.SecretValue(props.apiKey);
  const cdkBuildAction = new codepipeline_actions.CodeBuildAction({
    actionName: "Cdk_Build",
    project: props.project,
    input: props.input,
    outputs: props.outputs,
    environmentVariables: {
      GITHUB_API_KEY: {
        type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
        value: apiKeySecret,
      },
    },
  });

  return {
    stageName: "Build",
    actions: [cdkBuildAction],
  };
};
