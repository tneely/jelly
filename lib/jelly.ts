import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";

import { Api, Authentication, Database, Cdn } from "./constructs";

export interface JellyProps extends cdk.StackProps {
  readonly appName: string;
  readonly apiBucket: s3.IBucket;
  readonly apiBucketKey: string;
  readonly siteBucket: s3.IBucket;
  readonly siteBucketKey: string;
  readonly apiDomainName?: string;
  readonly siteDomainName?: string;
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
    this.database = new Database(this);
    this.cdn = new Cdn(this, {
      siteBucket: props.siteBucket,
      siteBucketKey: props.siteBucketKey,
      domainName: props.siteDomainName,
    });
    this.auth = new Authentication(this, {
      appName: props.appName,
    });
    this.api = new Api(this, {
      apiBucket: props.apiBucket,
      apiBucketKey: props.apiBucketKey,
      database: this.database.table,
      domainName: props.apiDomainName,
      auth: this.auth,
    });
  }
}
