import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as codebuild from "@aws-cdk/aws-codebuild";

export interface BuildStageProps {
  name: string;
  project: codebuild.Project;
  input: codepipeline.Artifact;
  outputs: codepipeline.Artifact[];
  env?: {
    [name: string]: codebuild.BuildEnvironmentVariable;
  };
}

export class BuildStage implements codepipeline.StageOptions {
  public readonly stageName: string;
  public readonly actions: codepipeline.IAction[];
  constructor(props: BuildStageProps) {
    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: `${props.name}_Build`,
      project: props.project,
      input: props.input,
      outputs: props.outputs,
      environmentVariables: props.env,
    });

    this.stageName = `${props.name}Build`;
    this.actions = [buildAction];
  }
}
