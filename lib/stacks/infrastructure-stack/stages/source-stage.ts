import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import { GithubDetails } from "../../../shapes/github-details";

export interface SourceStageProps {
  output: codepipeline.Artifact;
  github: GithubDetails;
}

export const SourceStage = (props: SourceStageProps): codepipeline.StageOptions => {
  const cdkSource = new codepipeline_actions.GitHubSourceAction({
    actionName: "GitHub_Source",
    owner: props.github.owner,
    repo: props.github.repo,
    output: props.output,
    oauthToken: new cdk.SecretValue(props.github.key),
  });

  return {
    stageName: "Source",
    actions: [cdkSource],
  };
};
