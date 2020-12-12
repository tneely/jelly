import { Stack, Construct, StackProps, pipelines, SecretValue, App } from "aws-cdk-lib";
import { LinuxBuildImage } from "aws-cdk-lib/lib/aws-codebuild";
import { Artifact } from "aws-cdk-lib/lib/aws-codepipeline";
import { GitHubSourceAction } from "aws-cdk-lib/lib/aws-codepipeline-actions";
import { ExampleJellyApp } from "../lib/example-jelly-app";

const gitHubOAuthToken = "github/token/example-jelly-app";

class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceArtifact = new Artifact();
    const cloudAssemblyArtifact = new Artifact("CloudAssemblyArtifact");

    const pipeline = new pipelines.CdkPipeline(this, "Pipeline", {
      pipelineName: "ExampleJellyAppPipeline",
      cloudAssemblyArtifact,

      sourceAction: new GitHubSourceAction({
        actionName: "GitHub",
        output: sourceArtifact,
        oauthToken: SecretValue.secretsManager(gitHubOAuthToken),
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
          buildImage: LinuxBuildImage.STANDARD_4_0,
          privileged: true,
        },
      }),
    });

    pipeline.addApplicationStage(new ExampleJellyApp(this, "Prod"));
  }
}

const app = new App();
new PipelineStack(app, "PipelineStack");
