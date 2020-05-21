import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";

export interface AuthStackProps extends cdk.StackProps {}

/**
 * A CloudFormation stack for auth constructs
 */
export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: cdk.Construct, appName: string, props?: AuthStackProps) {
    super(scope, `${appName}AuthStack`, props);

    // Set up Cognito user pool and client to authenticate users
    this.userPool = new cognito.UserPool(this, "WebsiteUserPool", {
      userPoolName: `${appName}UserPool`,
      selfSignUpEnabled: true,
      requiredAttributes: {
        email: true,
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
      userPoolClientName: appName,
      // TODO: support OAuth flows?
    });
  }
}