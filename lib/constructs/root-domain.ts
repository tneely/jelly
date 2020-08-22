import * as cdk from "@aws-cdk/core";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as route53 from "@aws-cdk/aws-route53";
import * as route53patterns from "@aws-cdk/aws-route53-patterns";
import { Domain } from "./domain";

export interface RootDomainProps {
  baseDomainName: string;
}

/**
 * A CloudFormation stack for routing constructs
 */
export class RootDomain extends Domain {
  public readonly name: string;
  public readonly certificate: acm.ICertificate;

  constructor(scope: cdk.Construct, props: RootDomainProps) {
    super(scope, "RootDomain", { domainName: props.baseDomainName });

    this.name = `www.${props.baseDomainName}`;

    this.certificate = new acm.Certificate(this, "Certificate", {
      domainName: props.baseDomainName,
      subjectAlternativeNames: [`*.${props.baseDomainName}`],
      validation: acm.CertificateValidation.fromDns(this.hostedZone),
    });

    new route53patterns.HttpsRedirect(this, "WwwRedirect", {
      targetDomain: this.name,
      zone: this.hostedZone,
      certificate: this.certificate,
      recordNames: [props.baseDomainName],
    });
  }

  delegateSubDomain(subdomain: Domain) {
    return new route53.ZoneDelegationRecord(
      this,
      `ZoneDelegationRecord-${subdomain.hostedZone.zoneName}`,
      {
        zone: this.hostedZone,
        recordName: subdomain.hostedZone.zoneName,
        nameServers: subdomain.hostedZone.hostedZoneNameServers!,
      }
    );
  }
}
