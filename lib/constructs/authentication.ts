import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import * as routeAlias from "@aws-cdk/aws-route53-targets";
import { Routing } from "./routing";

export interface AuthenticationProps {
  appName: string;
  domainName?: string;
  rootRoute?: Routing;
}

/**
 * A CloudFormation stack for auth constructs
 */
export class Authentication extends cdk.Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly routing?: Routing;

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

    this.userPoolClient = this.userPool.addClient("WebsiteUserPoolClient", {
      userPoolClientName: props.appName,
      // TODO: support OAuth flows?
    });

    if (props.domainName) {
      this.routing = new Routing(this, {
        domainName: props.domainName,
      });

      props.rootRoute?.delegateSubDomain(this.routing.hostedZone);

      const domain = this.userPool.addDomain("AuthDomain", {
        customDomain: {
          domainName: props.domainName,
          certificate: this.routing.certificate,
        },
      });
      this.routing.addAliasTarget(new routeAlias.UserPoolDomainTarget(domain));
      // TODO: Generate sign in URL?
      // domain.signInUrl(this.userPoolClient, {
      //   redirectUri: props.rootHostedZone?.zoneName,
      // });
    }
  }
}
