import * as cdk from "@aws-cdk/core";

import { Api, Authentication, Database, Cdn, Routing } from "./constructs";

export interface JellyProps extends cdk.StackProps {
  appName: string;
  app: {
    assetPath: string;
  };
  api: {
    assetPath: string;
  };
  domain?: {
    name: string;
    apiSubdomainPrefix?: string;
    authSubdomainPrefix?: string;
  };
}

// TODO: should this be a stack?
export class Jelly extends cdk.Stack {
  public readonly api: Api;
  public readonly auth: Authentication;
  public readonly database: Database;
  public readonly cdn: Cdn;
  public readonly routing?: Routing;

  constructor(scope: cdk.Construct, props: JellyProps) {
    super(scope, "Jelly", props);

    if (props.domain) {
      this.routing = new Routing(this, {
        domainName: props.domain.name,
        apiSubdomainPrefix: props.domain.apiSubdomainPrefix,
        authSubdomainPrefix: props.domain.authSubdomainPrefix,
      });
    }

    this.database = new Database(this);

    this.cdn = new Cdn(this, {
      assetPath: props.app.assetPath,
      routing: this.routing,
    });

    this.auth = new Authentication(this, {
      appName: props.appName,
      routing: this.routing,
    });
    // Dependency needed so that alias exists on root domain before auth domain created
    // (userPool.addDomain throws a fit otherwise during initial CFn deployment)
    if (this.routing) this.auth.node.addDependency(this.cdn);

    this.api = new Api(this, {
      assetPath: props.api.assetPath,
      database: this.database.table,
      routing: this.routing,
      auth: this.auth,
    });
  }
}
