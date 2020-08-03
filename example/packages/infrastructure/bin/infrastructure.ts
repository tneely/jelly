import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as pipelines from "@aws-cdk/pipelines";
import * as s3 from "@aws-cdk/aws-s3";
import { ExampleJellyApp } from "../lib/example-jelly-app";

const gitHubOAuthToken = "github/token/example-jelly-app";
// TODO: Package api/app code as assets to avoid needing these buckets/keys
const apiBucketName = "example-jelly-app-api-bucket";
const siteBucketName = "example-jelly-app-site-bucket";
const assetKey = new Date().toISOString();

class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact("CloudAssemblyArtifact");
    const apiBuildArtifact = new codepipeline.Artifact("ApiBuildArtifact");
    const siteBuildArtifact = new codepipeline.Artifact("SiteBuildArtifact");

    const pipeline = new pipelines.CdkPipeline(this, "Pipeline", {
      pipelineName: "ExampleJellyAppPipeline",
      cloudAssemblyArtifact,

      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: "GitHub",
        output: sourceArtifact,
        oauthToken: cdk.SecretValue.secretsManager(gitHubOAuthToken),
        owner: "tneely",
        repo: "jelly",
        branch: "development",
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
        objectKey: assetKey,
      }),
      new codepipeline_actions.S3DeployAction({
        actionName: "UploadSite",
        bucket: siteBucket,
        input: siteBuildArtifact,
        extract: false,
        objectKey: assetKey,
      })
    );

    pipeline.addApplicationStage(
      new ExampleJellyApp(this, "Prod", {
        apiBucketName,
        apiBucketKey: assetKey,
        siteBucketName,
        siteBucketKey: assetKey,
      })
    );
  }
}

const app = new cdk.App();
new PipelineStack(app, "PipelineStack");
