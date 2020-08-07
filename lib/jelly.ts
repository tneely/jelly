import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";

import { Api, Authentication, Database, Cdn, Routing } from "./constructs";

export interface JellyProps extends cdk.StackProps {
  app: {
    source: s3deploy.ISource;
  };
  api: {
    code: lambda.Code;
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
      source: props.app.source,
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
      auth: this.auth,
    });
  }
}
