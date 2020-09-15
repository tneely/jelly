import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as pipelines from "@aws-cdk/pipelines";
import * as codebuild from "@aws-cdk/aws-codebuild";
import { ExampleJellyApp } from "../lib/example-jelly-app";

const gitHubOAuthToken = "github/token/example-jelly-app";

class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact("CloudAssemblyArtifact");

    const pipeline = new pipelines.CdkPipeline(this, "Pipeline", {
      pipelineName: "ExampleJellyAppPipeline",
      cloudAssemblyArtifact,

      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: "GitHub",
        output: sourceArtifact,
        oauthToken: cdk.SecretValue.secretsManager(gitHubOAuthToken),
        owner: "tneely",
        repo: "jelly",
      }),

      synthAction: new pipelines.SimpleSynthAction({
        sourceArtifact,
        cloudAssemblyArtifact,
        installCommands: ["npm install -g @microsoft/rush", "rush install"],
        buildCommands: ["rush build"],
        synthCommand: "mv example/infrastructure/cdk.out ./cdk.out",
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_4_0,
          privileged: true,
        },
      }),
    });

    pipeline.addApplicationStage(new ExampleJellyApp(this, "Prod"));
  }
}

const app = new cdk.App();
new PipelineStack(app, "PipelineStack");
