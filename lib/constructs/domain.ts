import * as cdk from "@aws-cdk/core";
import * as route53 from "@aws-cdk/aws-route53";
// import * as route53_patterns from "@aws-cdk/aws-route53-patterns";

export interface DomainProps {
  domainName: string;
}

/**
 * A CloudFormation stack for routing constructs
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
