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
      domainName: props.domainName,
      subjectAlternativeNames: [`*.${props.domainName}`],
      validation: acm.CertificateValidation.fromDns(this.hostedZone),
    });

    // Temp fix until https://github.com/aws/aws-cdk/pull/9291 is released
    ((this.certificate.node.defaultChild as acm.CfnCertificate).domainValidationOptions as Array<
      acm.CfnCertificate.DomainValidationOptionProperty
    >).pop();

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
