import * as cdk from "@aws-cdk/core";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as route53 from "@aws-cdk/aws-route53";
import { Domain, DomainProps } from "./domain";

export interface RootDomainProps extends DomainProps {}

/**
 * A CloudFormation stack for routing constructs
 */
export class RootDomain extends Domain {
  public readonly certificate: acm.ICertificate;

  constructor(scope: cdk.Construct, props: RootDomainProps) {
    super(scope, "RootDomain", props);

    this.certificate = new acm.Certificate(this, "Certificate", {
      domainName: `*.${props.domainName}`,
      validation: acm.CertificateValidation.fromDns(this.hostedZone),
    });

    new route53.CnameRecord(this, "WwwAlias", {
      zone: this.hostedZone,
      recordName: `www.${props.domainName}`,
      domainName: props.domainName,
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
