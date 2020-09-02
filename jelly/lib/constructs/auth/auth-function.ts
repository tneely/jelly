import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as codedeploy from "@aws-cdk/aws-codedeploy";
import * as path from "path";

export interface AuthFunctionProps {
    /**
     * Provider URL for the UserPool
     */
    userPoolProviderUrl: string;
    /**
     * UserPoolClient ID
     */
    userPoolClientId: string;
}

export class AuthFunction extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: AuthFunctionProps) {
    super(scope, id, {
        description: `Workaround to bug preventing no-change deployments: ${new Date().toISOString()}`,
        handler: "index.handler",
        code: lambda.Code.fromAsset(path.join(__dirname, "../../lambda/auth")),
        runtime: lambda.Runtime.NODEJS_12_X,
        environment: {
          USER_POOL_URL: props.userPoolProviderUrl,
          USER_CLIENT_ID: props.userPoolClientId,
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
        },
    });

    const alias = this.currentVersion.addAlias("Prod");
    new codedeploy.LambdaDeploymentGroup(this, "DeploymentGroup", {
      alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
    });
  }
}
