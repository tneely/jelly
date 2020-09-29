import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import * as routeAlias from "@aws-cdk/aws-route53-targets";
import * as lambda from "@aws-cdk/aws-lambda";
import { AuthFunction } from "./auth-function";
import { Routing } from "../routing";

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

    this.userPoolClient = this.createAuthClient(props.routing?.rootDomain.name);
    this.authHandler = new AuthFunction(this, "AuthHandler", {
      userPoolProviderUrl: this.userPool.userPoolProviderUrl,
      userPoolClientId: this.userPoolClient.userPoolClientId,
    });

    if (props.routing) {
      this.createAuthDomain(props.routing);
    }
  }

  private createAuthClient(rootDomainName?: string): cognito.UserPoolClient {
    const allowedDomains = rootDomainName
      ? [`https://${rootDomainName}`, `https://${rootDomainName}/`]
      : undefined;
    const client = this.userPool.addClient("UserPoolClient", {
      oAuth: {
        // TODO: support OAuth flows?
        callbackUrls: allowedDomains,
        logoutUrls: allowedDomains,
      },
    });

    return client;
  }

  private createAuthDomain(routing: Routing): void {
    const domain = this.userPool.addDomain("AuthDomain", {
      customDomain: {
        domainName: routing.authDomain.name,
        certificate: routing.rootDomain.certificate,
      },
    });
    routing.authDomain.addAliasTarget(new routeAlias.UserPoolDomainTarget(domain));
    new cdk.CfnOutput(this, "AuthUrl", {
      value: domain.signInUrl(this.userPoolClient, {
        redirectUri: `https://${routing.rootDomain.name}/`,
      }),
    });
  }
}
