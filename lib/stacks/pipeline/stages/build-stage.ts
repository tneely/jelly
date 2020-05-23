import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as codebuild from "@aws-cdk/aws-codebuild";

export interface BuildStageProps {
  project: codebuild.Project;
  input: codepipeline.Artifact;
  outputs: codepipeline.Artifact[];
  env: {
    [name: string]: codebuild.BuildEnvironmentVariable;
  };
}

export class BuildStage implements codepipeline.StageOptions {
  public readonly stageName: string;
  public readonly actions: codepipeline.IAction[];
  constructor(props: BuildStageProps) {
    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: `${props.project.projectName}_Build`,
      project: props.project,
      input: props.input,
      outputs: props.outputs,
      environmentVariables: props.env,
    });

    this.stageName = `${props.project.projectName}Build`;
    this.actions = [buildAction];
  }
}
