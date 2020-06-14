import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";

export interface AuthStackProps extends cdk.StackProps {
  appName: string;
}

/**
 * A CloudFormation stack for auth constructs
 */
export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: cdk.Construct, props: AuthStackProps) {
    super(scope, "AuthStack", props);

    // Set up Cognito user pool and client to authenticate users
    this.userPool = new cognito.UserPool(this, "WebsiteUserPool", {
      userPoolName: `${props.appName}UserPool`,
      selfSignUpEnabled: true,
      standardAttributes: {
        email: {
          required: true,
        },
      },
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        requireSymbols: false,
      },
    });
    this.userPoolClient = new cognito.UserPoolClient(this, "WebsiteUserPoolClient", {
      userPool: this.userPool,
      userPoolClientName: props.appName,
      // TODO: support OAuth flows?
    });
  }
}
