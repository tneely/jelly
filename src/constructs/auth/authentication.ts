import { CfnOutput, Construct } from "monocdk";
import { UserPool, UserPoolClient } from "monocdk/aws-cognito";
import { UserPoolDomainTarget } from "monocdk/lib/aws-route53-targets";
import { Routing } from "../routing";

export interface AuthProps {
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
 * A Construct to create the application's user authN and authZ
 */
export class Auth extends Construct {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, props: AuthProps) {
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

    this.userPoolClient = this.renderAuthClient(props.routing?.rootDomain.name);

    if (props.routing) {
      this.renderAuthDomain(props.routing);
    }
  }

  private renderAuthClient(rootDomainName?: string): UserPoolClient {
    const allowedDomains = rootDomainName ? [`https://${rootDomainName}`, `https://${rootDomainName}/`] : undefined;
    const client = this.userPool.addClient("UserPoolClient", {
      oAuth: {
        // TODO: support OAuth flows?
        callbackUrls: allowedDomains,
        logoutUrls: allowedDomains,
      },
    });

    return client;
  }

  private renderAuthDomain(routing: Routing): void {
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
