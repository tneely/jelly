import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import * as routeAlias from "@aws-cdk/aws-route53-targets";
import { Routing } from "./routing";

export interface AuthenticationProps {
  appName: string;
  routing?: Routing;
}

/**
 * A CloudFormation stack for auth constructs
 */
export class Authentication extends cdk.Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: cdk.Construct, props: AuthenticationProps) {
    super(scope, "Authentication");

    // Set up Cognito user pool and client to authenticate users
    this.userPool = new cognito.UserPool(this, "WebsiteUserPool", {
      userPoolName: `${props.appName}UserPool`,
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
    this.userPoolClient = this.userPool.addClient("WebsiteUserPoolClient", {
      userPoolClientName: props.appName,
      oAuth: {
        callbackUrls: rootDomainName ? [`https://${rootDomainName}`] : undefined,
      },
      // TODO: support OAuth flows?
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
          redirectUri: rootDomainName!,
        }),
      });
    }
  }
}
