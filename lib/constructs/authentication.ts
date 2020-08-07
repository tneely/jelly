import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import * as routeAlias from "@aws-cdk/aws-route53-targets";
import * as lambda from "@aws-cdk/aws-lambda";
import * as nodeLambda from "@aws-cdk/aws-lambda-nodejs";
import * as codedeploy from "@aws-cdk/aws-codedeploy";
import * as path from "path";
import { Routing } from "./routing";

export interface AuthenticationProps {
  /**
   * Routing to use for custom domains
   *
   * If present, the UserPool will be aliased to the auth domain name
   *
   * @default - The UserPool will not use a custom domain name
   */
  routing?: Routing;
}

/**
 * A Construct to create the application's user authentication
 */
export class Authentication extends cdk.Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly authHandler: lambda.Function;

  constructor(scope: cdk.Construct, props: AuthenticationProps) {
    super(scope, "Authentication");

    this.userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: true,
      standardAttributes: {
        email: {
          required: true,
        },
      },
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        requireSymbols: false,
      },
    });

    const rootDomainName = props.routing?.rootDomain.name;
    this.userPoolClient = this.userPool.addClient("UserPoolClient", {
      oAuth: {
        // TODO: support OAuth flows?
        callbackUrls: rootDomainName ? [`https://${rootDomainName}`] : undefined,
      },
    });

    if (props.routing) {
      const domain = this.userPool.addDomain("AuthDomain", {
        customDomain: {
          domainName: props.routing.authDomain.name,
          certificate: props.routing.rootDomain.certificate,
        },
      });
      props.routing.authDomain.addAliasTarget(new routeAlias.UserPoolDomainTarget(domain));
      new cdk.CfnOutput(this, "AuthUrl", {
        value: domain.signInUrl(this.userPoolClient, {
          redirectUri: `https://${rootDomainName}`,
        }),
      });
    }

    this.authHandler = new nodeLambda.NodejsFunction(this, "AuthHandler", {
      entry: path.join(__dirname, "../lambda/authentication/index.js"),
      projectRoot: path.resolve(__dirname, "../../.."),
      minify: true,
    });

    const alias = new lambda.Alias(this, "Alias", {
      aliasName: "Prod",
      version: this.authHandler.currentVersion,
    });

    new codedeploy.LambdaDeploymentGroup(this, "DeploymentGroup", {
      alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
    });
  }
}
