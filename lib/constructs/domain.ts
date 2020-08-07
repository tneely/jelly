import * as cdk from "@aws-cdk/core";
import * as route53 from "@aws-cdk/aws-route53";

export interface DomainProps {
  /**
   * The domain name to create in Route53
   */
  domainName: string;
}

/**
 * A Construct to create and host the application's custom domain
 */
export class Domain extends cdk.Construct {
  public readonly hostedZone: route53.HostedZone;
  public readonly name: string;

  constructor(scope: cdk.Construct, id: string, props: DomainProps) {
    super(scope, id);

    this.name = props.domainName;
    this.hostedZone = new route53.PublicHostedZone(this, "HostedZone", {
      zoneName: props.domainName,
    });
  }

  addAliasTarget(aliasTarget: route53.IAliasRecordTarget) {
    return new route53.ARecord(this, "AliasRecord", {
      zone: this.hostedZone,
      target: route53.RecordTarget.fromAlias(aliasTarget),
    });
  }
}
