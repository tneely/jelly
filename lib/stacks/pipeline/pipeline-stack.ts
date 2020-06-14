import * as cdk from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import {
  BuildStage,
  StackDeployStage,
  SelfUpdateStage,
  SourceStage,
  ApiUpdateStage,
  SiteUpdateStage,
} from "./stages";
import { RepositoryDetails } from "../../shapes/repository-details";
import {
  DistributionStack,
  AuthStack,
  DataStack,
  RoutingStack,
  ApiStack,
  ApiGatewayStack,
} from "..";

export interface PipelineStackProps extends cdk.StackProps {
  readonly appName: string;
  readonly repoApiKey: string;
  readonly cdkRepo: RepositoryDetails;
  readonly appRepo: RepositoryDetails;
  readonly stacks: {
    // Primary Stacks
    readonly distributionStack: DistributionStack;
    readonly authStack: AuthStack;
    readonly dataStack: DataStack;
    readonly routingStack: RoutingStack; // Independent???
    readonly apiGatewayStack: ApiGatewayStack;
    // Secondary Stacks
    readonly apiStack: ApiStack;
  };
}

/**
 * A CloudFormation stack for pipeline constructs
 */
export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, props: PipelineStackProps) {
    super(scope, "PipelineStack", props);

    const pipeline = new codepipeline.Pipeline(this, "Pipeline", {
      restartExecutionOnUpdate: true,
    });

    const cdkSourceOutput = new codepipeline.Artifact("CdkSourceOutput");
    const appSourceOutput = new codepipeline.Artifact("AppSourceOutput");
    pipeline.addStage(
      new SourceStage({
        apiKey: props.repoApiKey,
        sources: {
          CDK: {
            output: cdkSourceOutput,
            github: props.cdkRepo,
          },
          App: {
            output: appSourceOutput,
            github: props.appRepo,
          },
        },
      })
    );

    const cdkProject = new codebuild.PipelineProject(this, `${props.appName}-CDK`);
    const cdkBuildOutput = new codepipeline.Artifact("CdkBuildOutput");
    pipeline.addStage(
      new BuildStage({
        name: "CDK",
        project: cdkProject,
        input: cdkSourceOutput,
        outputs: [cdkBuildOutput],
        env: {
          REPOSITORY_API_KEY: {
            value: props.repoApiKey,
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
        stacks: [
          props.stacks.authStack,
          props.stacks.dataStack,
          props.stacks.distributionStack,
          props.stacks.apiGatewayStack,
          props.stacks.routingStack,
        ],
      })
    );

    const appProject = new codebuild.PipelineProject(this, `${props.appName}-App`);
    const apiBuildOutput = new codepipeline.Artifact("ApiBuildOutput");
    const siteBuildOutput = new codepipeline.Artifact("SiteBuildOutput");
    pipeline.addStage(
      new BuildStage({
        name: "App",
        project: appProject,
        input: appSourceOutput,
        // TODO: Build site and api separately?
        outputs: [siteBuildOutput, apiBuildOutput],
        env: {
          REACT_APP_AWS_REGION: {
            value: this.region,
          },
          REACT_APP_USER_POOL_ID: {
            value: props.stacks.authStack.userPool.userPoolId,
          },
          REACT_APP_USER_POOL_CLIENT_ID: {
            value: props.stacks.authStack.userPoolClient.userPoolClientId,
          },
          REACT_APP_API_INVOKE_URL: {
            value: props.stacks.apiGatewayStack.api.httpApiId,
          },
        },
      })
    );

    pipeline.addStage(
      new ApiUpdateStage({
        cdkInput: cdkBuildOutput,
        apiInput: apiBuildOutput,
        apiStack: props.stacks.apiStack,
      })
    );

    pipeline.addStage(
      new SiteUpdateStage(this, {
        input: siteBuildOutput,
        bucket: props.stacks.distributionStack.siteBucket,
        distribution: props.stacks.distributionStack.distribution,
      })
    );
  }
}
