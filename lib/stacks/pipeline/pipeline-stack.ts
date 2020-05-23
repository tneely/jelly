import * as cdk from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import {
  BuildStage,
  StackDeployStage,
  SelfUpdateStage,
  SourceStage,
  SiteUpdateStage,
  ApiUpdateStage,
} from "./stages";
import { GithubDetails } from "../../shapes/github-details";
import { DistributionStack, AuthStack, ApiStack, DataStack, RoutingStack } from "../";
export interface PipelineStackProps extends cdk.StackProps {
  apiKey: string;
  cdkGithub: GithubDetails;
  appGithub: GithubDetails;
  // Independent Stacks
  distributionStack: DistributionStack;
  authStack: AuthStack;
  dataStack: DataStack;
  // Dependent Stacks
  apiStack: ApiStack;
  routingStack: RoutingStack; // Independent???
}

/**
 * A CloudFormation stack for pipeline constructs
 */
export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, appName: string, props: PipelineStackProps) {
    super(scope, `${appName}PipelineStack`, props);

    const pipeline = new codepipeline.Pipeline(this, "Pipeline", {
      restartExecutionOnUpdate: true,
    });

    const cdkSourceOutput = new codepipeline.Artifact("CdkSourceOutput");
    const appSourceOutput = new codepipeline.Artifact("AppSourceOutput");
    pipeline.addStage(
      new SourceStage({
        apiKey: props.apiKey,
        sources: {
          cdk: {
            output: cdkSourceOutput,
            github: props.cdkGithub,
          },
          app: {
            output: appSourceOutput,
            github: props.appGithub,
          },
        },
      })
    );

    const cdkProject = new codebuild.PipelineProject(this, `${appName}`);
    const cdkBuildOutput = new codepipeline.Artifact("CdkBuildOutput");
    pipeline.addStage(
      new BuildStage({
        project: cdkProject,
        input: cdkSourceOutput,
        outputs: [cdkBuildOutput],
        env: {
          GITHUB_API_KEY: {
            value: props.apiKey,
          },
        },
      })
    );

    pipeline.addStage(
      new SelfUpdateStage({
        stack: this,
        input: cdkBuildOutput,
      })
    );

    pipeline.addStage(
      new StackDeployStage({
        input: cdkBuildOutput,
        stacks: [props.authStack, props.dataStack, props.distributionStack],
      })
    );

    const appProject = new codebuild.PipelineProject(this, "AppProject");
    const apiBuildOutput = new codepipeline.Artifact("ApiBuildOutput");
    const siteBuildOutput = new codepipeline.Artifact("SiteBuildOutput");
    pipeline.addStage(
      new BuildStage({
        project: appProject,
        input: appSourceOutput,
        // TODO: Build site and api separately?
        outputs: [siteBuildOutput, apiBuildOutput],
        env: {
          REACT_APP_AWS_REGION: {
            value: this.region,
          },
          REACT_APP_USER_POOL_ID: {
            value: props.authStack.userPool,
          },
          REACT_APP_USER_POOL_CLIENT_ID: {
            value: props.authStack.userPoolClient,
          },
          REACT_APP_API_INVOKE_URL: {
            value: props.apiStack,
          },
        },
      })
    );

    pipeline.addStage(
      new ApiUpdateStage({
        cdkInput: cdkBuildOutput,
        apiInput: apiBuildOutput,
        apiStack: props.apiStack,
      })
    );

    pipeline.addStage(
      new SiteUpdateStage(this, {
        input: siteBuildOutput,
        bucket: props.distributionStack.siteBucket,
        distribution: props.distributionStack.distribution,
      })
    );
  }
}
