import * as cdk from "@aws-cdk/core";

import { Api, Authentication, Database, Cdn, Routing } from "./constructs";
import { ApiOptions } from "./constructs/api/api";
import { ClientOptions } from "./constructs/client";
import { RoutingOptions } from "./constructs/routing";
import { DatabaseOptions } from "./constructs/database";

export interface JellyProps extends cdk.StackProps {
  /**
   * Properties related to the web client
   */
  client: ClientOptions;

  /**
   * Properties related to the API
   */
  api: ApiOptions;

  /**
   * Properties related to the database
   *
   * @default - No tables will be created
   */
  database?: DatabaseOptions;

  /**
   * Domain routing
   *
   * @default - No routing will be done
   */
  routing?: RoutingOptions;
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
        ...props.routing,
      });
    }

    this.database = new Database(this, props.database);

    this.cdn = new Cdn(this, {
      ...props.client,
      routing: this.routing,
    });

    this.auth = new Authentication(this, {
      routing: this.routing,
    });

    // Dependency needed so that alias exists on root domain before auth domain created
    // (userPool.addDomain throws a fit otherwise during initial CFn deployment)
    if (this.routing) this.auth.node.addDependency(this.cdn);

    this.api = new Api(this, {
      ...props.api,
      database: this.database,
      routing: this.routing,
      authHandler: this.auth.authHandler,
    });
  }
}
