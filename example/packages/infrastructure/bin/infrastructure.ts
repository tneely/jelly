import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as pipelines from "@aws-cdk/pipelines";
import * as s3 from "@aws-cdk/aws-s3";
import { ExampleJellyApp } from "../lib/example-jelly-app";

const gitHubOAuthToken = "github/token/example-jelly-app";
const apiBucketName = "example-jelly-app-api-bucket";
const apiBucketKey = "api";
const siteBucketName = "example-jelly-app-site-bucket";
const siteBucketKey = "site";

class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact("CloudAssemblyArtifact");
    const apiBuildArtifact = new codepipeline.Artifact("ApiBuildArtifact");
    const siteBuildArtifact = new codepipeline.Artifact("SiteBuildArtifact");

    const pipeline = new pipelines.CdkPipeline(this, "Pipeline", {
      pipelineName: "MyAppPipeline", // TODO: Rename
      cloudAssemblyArtifact,

      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: "GitHub",
        output: sourceArtifact,
        oauthToken: cdk.SecretValue.secretsManager(gitHubOAuthToken),
        owner: "tneely",
        repo: "jelly",
        // TODO: Point to testing branch so that I don't commit all these tweaks to master
      }),

      synthAction: pipelines.SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        installCommand: "npm ci && npm run install-example",
        buildCommand: "npm run build && npm run build-example",
        synthCommand: "npm run synth-example",
        additionalArtifacts: [
          {
            directory: "example/packages/api/dist",
            artifact: apiBuildArtifact,
          },
          {
            directory: "example/packages/app/build",
            artifact: siteBuildArtifact,
          },
        ],
      }),
    });

    const apiBucket = new s3.Bucket(this, "ApiBucket", {
      bucketName: apiBucketName,
    });
    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      bucketName: siteBucketName,
    });

    const assetStage = pipeline.addStage("UploadAssets");
    assetStage.addActions(
      new codepipeline_actions.S3DeployAction({
        actionName: "UploadApi",
        bucket: apiBucket,
        input: apiBuildArtifact,
        extract: false,
        objectKey: apiBucketKey,
      }),
      new codepipeline_actions.S3DeployAction({
        actionName: "UploadSite",
        bucket: siteBucket,
        input: siteBuildArtifact,
        extract: false,
        objectKey: siteBucketKey,
      })
    );

    pipeline.addApplicationStage(
      new ExampleJellyApp(this, "Prod", {
        apiBucketName,
        apiBucketKey,
        siteBucketName,
        siteBucketKey,
      })
    );
  }
}

const app = new cdk.App();
new PipelineStack(app, "PipelineStack");
