import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import { RepositoryDetails } from "../../../model/repository-details";

export interface SourceStageProps {
  apiKey: string;
  sources: {
    [sourceName: string]: {
      output: codepipeline.Artifact;
      github: RepositoryDetails;
    };
  };
}

export class SourceStage implements codepipeline.StageOptions {
  public readonly stageName: string;
  public readonly actions: codepipeline.IAction[];
  constructor(props: SourceStageProps) {
    this.stageName = "Source";
    this.actions = Object.keys(props.sources).map(
      (sourceName) =>
        new codepipeline_actions.GitHubSourceAction({
          actionName: `${sourceName}_Source`,
          owner: props.sources[sourceName].github.owner,
          repo: props.sources[sourceName].github.repo,
          output: props.sources[sourceName].output,
          oauthToken: new cdk.SecretValue(props.apiKey),
        })
    );
  }
}
