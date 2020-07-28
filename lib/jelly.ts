import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";

import { Api, Authentication, Database, Cdn } from "./constructs";

export interface JellyProps extends cdk.StackProps {
  readonly appName: string;
  readonly domainName: string;
  readonly apiBucket: s3.IBucket;
  readonly apiBucketKey: string;
  readonly siteBucket: s3.IBucket;
  readonly siteBucketKey: string;
  readonly apiSubDomainPrefix?: string;
  readonly authSubDomainPrefix?: string;
}

/**
 * TODO: Add documentation, should this be a stack?
 */
export class Jelly extends cdk.Stack {
  public readonly api: Api;
  public readonly auth: Authentication;
  public readonly database: Database;
  public readonly cdn: Cdn;

  constructor(scope: cdk.Construct, props: JellyProps) {
    super(scope, "Jelly", props);

    const apiSubDomainPrefix = props.apiSubDomainPrefix ?? "api";
    const authSubDomainPrefix = props.authSubDomainPrefix ?? "auth";

    this.database = new Database(this);
    this.cdn = new Cdn(this, {
      siteBucket: props.siteBucket,
      siteBucketKey: props.siteBucketKey,
      domainName: props.domainName,
    });
    this.auth = new Authentication(this, {
      appName: props.appName,
      domainName: `${authSubDomainPrefix}.${props.domainName}`,
      rootRoute: this.cdn.routing,
    });
    // Dependency needed so that alias exists on root domain before auth domain created
    this.auth.node.addDependency(this.cdn);
    this.api = new Api(this, {
      apiBucket: props.apiBucket,
      apiBucketKey: props.apiBucketKey,
      database: this.database.table,
      domainName: `${apiSubDomainPrefix}.${props.domainName}`,
      rootRoute: this.cdn.routing,
      auth: this.auth,
    });
  }
}
