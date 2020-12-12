import { Construct } from "aws-cdk-lib";
import { ICertificate, CertificateValidation, Certificate } from "aws-cdk-lib/lib/aws-certificatemanager";
import { ZoneDelegationRecord } from "aws-cdk-lib/lib/aws-route53";
import { HttpsRedirect } from "aws-cdk-lib/lib/aws-route53-patterns";
import { Domain } from "./domain";

export interface RootDomainProps {
  baseDomainName: string;
}

/**
 * A CloudFormation stack for routing constructs
 */
export class RootDomain extends Domain {
  public readonly name: string;
  public readonly certificate: ICertificate;

  constructor(scope: Construct, props: RootDomainProps) {
    super(scope, "RootDomain", { domainName: props.baseDomainName });

    this.name = `www.${props.baseDomainName}`;

    this.certificate = new Certificate(this, "Certificate", {
      domainName: props.baseDomainName,
      subjectAlternativeNames: [`*.${props.baseDomainName}`],
      validation: CertificateValidation.fromDns(this.hostedZone),
    });

    new HttpsRedirect(this, "WwwRedirect", {
      targetDomain: this.name,
      zone: this.hostedZone,
      certificate: this.certificate,
      recordNames: [props.baseDomainName],
    });
  }

  delegateSubDomain(subdomain: Domain): ZoneDelegationRecord {
    return new ZoneDelegationRecord(this, `ZoneDelegationRecord-${subdomain.hostedZone.zoneName}`, {
      zone: this.hostedZone,
      recordName: subdomain.hostedZone.zoneName,
      nameServers: subdomain.hostedZone.hostedZoneNameServers!,
    });
  }
}
