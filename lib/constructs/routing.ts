import * as cdk from "@aws-cdk/core";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as route53 from "@aws-cdk/aws-route53";
// import * as route53_patterns from "@aws-cdk/aws-route53-patterns";

export interface RoutingProps {
  readonly domainName: string;
  readonly addWwwAlias?: boolean;
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

    if (props.addWwwAlias) {
      new route53.CnameRecord(this, "WwwAlias", {
        zone: this.hostedZone,
        recordName: `www.${props.domainName}`,
        domainName: props.domainName,
      });
      // TODO: Redirect instead?
      // new route53_patterns.HttpsRedirect(this, "WwwRedirect", {
      //   targetDomain: props.domainName,
      //   zone: this.hostedZone,
      //   recordNames: [`www.${props.domainName}`],
      // });
    }
  }

  addAliasTarget(aliasTarget: route53.IAliasRecordTarget) {
    return new route53.ARecord(this, "AliasRecord", {
      zone: this.hostedZone,
      target: route53.RecordTarget.fromAlias(aliasTarget),
    });
  }

  delegateSubDomain(subdomainZone: route53.HostedZone) {
    return new route53.ZoneDelegationRecord(
      this,
      `ZoneDelegationRecord-${subdomainZone.zoneName}`,
      {
        zone: this.hostedZone,
        recordName: subdomainZone.zoneName,
        nameServers: subdomainZone.hostedZoneNameServers!,
      }
    );
  }
}
