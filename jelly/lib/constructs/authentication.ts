import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import * as routeAlias from "@aws-cdk/aws-route53-targets";
import * as lambda from "@aws-cdk/aws-lambda";
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

    this.userPoolClient = this.createAuthClient(props.routing?.rootDomain.name);
    this.authHandler = this.createAuthHandler();

    if (props.routing) {
      this.createAuthDomain(props.routing);
    }
  }

  private createAuthClient(rootDomainName?: string): cognito.UserPoolClient {
    const client = this.userPool.addClient("UserPoolClient", {
      oAuth: {
        // TODO: support OAuth flows?
        callbackUrls: rootDomainName
          ? [`https://${rootDomainName}`, `https://${rootDomainName}/`]
          : undefined,
      },
    });

    // FIXME: Introduce proper logout url config in the userpool client
    (client.node.defaultChild as cognito.CfnUserPoolClient).logoutUrLs = [
      `https://${rootDomainName}`,
      `https://${rootDomainName}/`,
    ];

    return client;
  }

  private createAuthHandler(): lambda.Function {
    const authHandler = new lambda.Function(this, "AuthHandler", {
      description: `Workaround to current version bug: ${new Date().toISOString()}`,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda/auth")),
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: {
        USER_POOL_URL: this.userPool.userPoolProviderUrl,
        USER_CLIENT_ID: this.userPoolClient.userPoolClientId,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      },
    });

    const alias = authHandler.currentVersion.addAlias("Prod");
    new codedeploy.LambdaDeploymentGroup(this, "DeploymentGroup", {
      alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
    });

    return authHandler;
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
