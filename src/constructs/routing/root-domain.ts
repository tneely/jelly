import { Construct } from "monocdk";
import { ICertificate, CertificateValidation, Certificate } from "monocdk/aws-certificatemanager";
import { ZoneDelegationRecord } from "monocdk/aws-route53";
import { HttpsRedirect } from "monocdk/aws-route53-patterns";
import { Domain } from "./domain";

export interface RootDomainProps {
  baseDomainName: string;
}

/**
 * A Construct to represent the application's root domain
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
    if (!subdomain.hostedZone.hostedZoneNameServers) {
      throw new Error(
        `The subdomain ${subdomain.name} has no hosted zone name servers. This may occur if it is private or imported from another stack.`
      );
    }
    return new ZoneDelegationRecord(this, `ZoneDelegationRecord-${subdomain.hostedZone.zoneName}`, {
      zone: this.hostedZone,
      recordName: subdomain.hostedZone.zoneName,
      nameServers: subdomain.hostedZone.hostedZoneNameServers,
    });
  }
}
