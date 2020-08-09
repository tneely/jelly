import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";

import { Api, Authentication, Database, Cdn, Routing } from "./constructs";
import { RoutingProps } from "./constructs/routing";

export interface JellyProps extends cdk.StackProps {
  /**
   * Properties related to the web client
   */
  client: {
    /**
     * The source code to distribute
     */
    source: s3deploy.ISource;
  };

  /**
   * Properties related to the API
   */
  api: {
    /**
     * The lambda code to deploy
     */
    code: lambda.Code;
  };

  /**
   * Domain routing
   *
   * @default - No routing will be done
   */
  routing?: RoutingProps;
}

export class Jelly extends cdk.Stack {
  public readonly api: Api;
  public readonly auth: Authentication;
  public readonly database: Database;
  public readonly cdn: Cdn;
  public readonly routing?: Routing;

  constructor(scope: cdk.Construct, props: JellyProps) {
    super(scope, "Jelly", props);

    if (props.routing) {
      this.routing = new Routing(this, {
        domainName: props.routing.domainName,
        apiSubdomainPrefix: props.routing.apiSubdomainPrefix,
        authSubdomainPrefix: props.routing.authSubdomainPrefix,
      });
    }

    this.database = new Database(this);

    this.cdn = new Cdn(this, {
      source: props.client.source,
      routing: this.routing,
    });

    this.auth = new Authentication(this, {
      routing: this.routing,
    });

    // Dependency needed so that alias exists on root domain before auth domain created
    // (userPool.addDomain throws a fit otherwise during initial CFn deployment)
    if (this.routing) this.auth.node.addDependency(this.cdn);

    this.api = new Api(this, {
      code: props.api.code,
      database: this.database.table,
      routing: this.routing,
      authHandler: this.auth.authHandler,
    });
  }
}
