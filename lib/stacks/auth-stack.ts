import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import * as config from "../../config/app-config.json";

export interface AuthStackProps extends cdk.StackProps {}

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(app: cdk.App, appName: string, props?: AuthStackProps) {
    super(app, `${appName}AuthStack`, props);

    // Set up Cognito user pool and client to authenticate users
    this.userPool = new cognito.UserPool(this, "WebsiteUserPool", {
      userPoolName: `${config.appName}UserPool`,
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
    this.userPoolClient = new cognito.UserPoolClient(
      this,
      "WebsiteUserPoolClient",
      {
        userPool: this.userPool,
        userPoolClientName: config.appName,
        // TODO: support OAuth flows?
      }
    );
  }
}
