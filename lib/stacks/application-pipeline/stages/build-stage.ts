import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as cognito from "@aws-cdk/aws-cognito";
import * as api_gateway from "@aws-cdk/aws-apigatewayv2";

export interface BuildStageProps {
  project: codebuild.Project;
  input: codepipeline.Artifact;
  outputs: codepipeline.Artifact[];
  env: {
    region: string;
    userPool: cognito.UserPool;
    userPoolClient: cognito.UserPoolClient;
    //TODO: change this to the API gateway construct instead of a string
    api: api_gateway.HttpApi;
  };
}

export const BuildStage = (props: BuildStageProps): codepipeline.StageOptions => {
  const appBuildAction = new codepipeline_actions.CodeBuildAction({
    actionName: "App_Build",
    project: props.project,
    input: props.input,
    // TODO: Update app buildspec for multiple outputs
    // https://docs.aws.amazon.com/codebuild/latest/userguide/sample-multi-in-out.html
    outputs: props.outputs,
    environmentVariables: {
      REACT_APP_AWS_REGION: {
        type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
        value: props.env.region,
      },
      REACT_APP_USER_POOL_ID: {
        type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
        value: props.env.userPool.userPoolId,
      },
      REACT_APP_USER_POOL_CLIENT_ID: {
        type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
        value: props.env.userPoolClient.userPoolClientId,
      },
      REACT_APP_API_INVOKE_URL: {
        type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
        value: props.env.api.url,
      },
    },
  });

  return {
    stageName: "Build",
    actions: [appBuildAction],
  };
};
