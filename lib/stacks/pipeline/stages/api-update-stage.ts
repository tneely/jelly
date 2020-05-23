import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import { ApiStack } from "../../api-stack";

export interface ApiUpdateStageProps {
  cdkInput: codepipeline.Artifact;
  apiInput: codepipeline.Artifact;
  apiStack: ApiStack;
}

export class ApiUpdateStage implements codepipeline.StageOptions {
  public readonly stageName: string;
  public readonly actions: codepipeline.IAction[];
  constructor(props: ApiUpdateStageProps) {
    const apiDeployAction = new codepipeline_actions.CloudFormationCreateUpdateStackAction({
      actionName: "Stack_Deploy",
      templatePath: props.cdkInput.atPath(props.apiStack.templateFile),
      stackName: props.apiStack.stackName,
      adminPermissions: true,
      parameterOverrides: {
        ...props.apiStack.lambdaCode.assign(props.apiInput.s3Location),
      },
      extraInputs: [props.apiInput],
    });

    this.stageName = "ApiUpdate";
    this.actions = [apiDeployAction];
  }
}
