import { Construct, CfnOutput } from "aws-cdk-lib";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { UserPoolDomainTarget } from "aws-cdk-lib/lib/aws-route53-targets";
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
export class Authentication extends Construct {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, props: AuthenticationProps) {
    super(scope, "Authentication");

    this.userPool = new UserPool(this, "UserPool", {
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

    if (props.routing) {
      this.createAuthDomain(props.routing);
    }
  }

  private createAuthClient(rootDomainName?: string): UserPoolClient {
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
    routing.authDomain.addAliasTarget(new UserPoolDomainTarget(domain));
    new CfnOutput(this, "AuthUrl", {
      value: domain.signInUrl(this.userPoolClient, {
        redirectUri: `https://${routing.rootDomain.name}/`,
      }),
    });
  }
}
