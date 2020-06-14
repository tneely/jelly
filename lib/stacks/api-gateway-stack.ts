import * as cdk from "@aws-cdk/core";
import * as api_gateway from "@aws-cdk/aws-apigatewayv2";

export interface ApiGatewayStackProps extends cdk.StackProps {
  appName: string;
}

/**
 * A CloudFormation stack for API Gateway constructs
 */
export class ApiGatewayStack extends cdk.Stack {
  public readonly api: api_gateway.HttpApi;

  constructor(scope: cdk.Construct, props: ApiGatewayStackProps) {
    super(scope, "ApiGatewayStack", props);
    this.api = new api_gateway.HttpApi(this, `${props.appName}Api`);
  }
}
