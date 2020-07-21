import * as cdk from "@aws-cdk/core";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as route53 from "@aws-cdk/aws-route53";

export interface RoutingProps {
  readonly domainName: string;
  readonly rootHostedZone?: route53.HostedZone;
}

/**
 * A CloudFormation stack for routing constructs
 */
export class Routing extends cdk.Construct {
  public readonly hostedZone: route53.HostedZone;
  public readonly certificate: acm.ICertificate;
  constructor(scope: cdk.Construct, props: RoutingProps) {
    super(scope, "Routing");

    this.hostedZone = new route53.PublicHostedZone(this, "HostedZone", {
      zoneName: props.domainName,
    });

    this.certificate = new acm.Certificate(this, "Certificate", {
      domainName: props.domainName,
      validation: acm.CertificateValidation.fromDns(this.hostedZone),
    });

    if (props.rootHostedZone) {
      new route53.ZoneDelegationRecord(this, "ZoneDelegationRecord", {
        zone: props.rootHostedZone,
        recordName: props.domainName,
        nameServers: this.hostedZone.hostedZoneNameServers!,
      });
    }
  }

  addAliasTarget(aliasTarget: route53.IAliasRecordTarget) {
    return new route53.ARecord(this, "AliasRecord", {
      zone: this.hostedZone,
      target: route53.RecordTarget.fromAlias(aliasTarget),
    });
  }
}
