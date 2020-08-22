import * as cdk from "@aws-cdk/core";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as route53 from "@aws-cdk/aws-route53";
import * as route53patterns from "@aws-cdk/aws-route53-patterns";
import { Domain } from "./domain";

export interface RoutingOptions {
  /**
   * The base domain name (e.g. "example.com")
   */
  baseDomainName: string;

  /**
   * Subdomain prefix to use for the API (e.g. "api" for api.example.com)
   *
   * @default "api"
   */
  apiSubdomainPrefix?: string;

  /**
   * Subdomain prefix to use for authentication (e.g. "auth" for auth.example.com)
   *
   * @default "auth"
   */
  authSubdomainPrefix?: string;
}

export interface RoutingProps extends RoutingOptions {}

/**
 * A Construct to create and manage the application's custom domains
 */
export class Routing extends cdk.Construct {
  public readonly baseDomainName: string;
  public readonly certificate: acm.Certificate;
  public readonly rootDomain: Domain;
  public readonly apiDomain: Domain;
  public readonly authDomain: Domain;

  constructor(scope: cdk.Construct, props: RoutingProps) {
    super(scope, "Routing");

    this.baseDomainName = props.baseDomainName;
    const apiSubDomainPrefix = props.apiSubdomainPrefix ?? "api";
    const authSubDomainPrefix = props.authSubdomainPrefix ?? "auth";

    this.rootDomain = new Domain(this, "RootDomain", { domainName: `www.${this.baseDomainName}` });
    this.apiDomain = new Domain(this, "ApiDomain", {
      domainName: `${apiSubDomainPrefix}.${this.baseDomainName}`,
    });
    this.authDomain = new Domain(this, "AuthDomain", {
      domainName: `${authSubDomainPrefix}.${this.baseDomainName}`,
    });

    this.delegateSubDomain(this.apiDomain);
    this.delegateSubDomain(this.authDomain);

    this.certificate = new acm.Certificate(this, "Certificate", {
      domainName: this.baseDomainName,
      subjectAlternativeNames: [`*.${this.baseDomainName}`],
      validation: acm.CertificateValidation.fromDns(this.rootDomain.hostedZone),
    });

    new route53patterns.HttpsRedirect(this, "WwwRedirect", {
      targetDomain: this.rootDomain.name,
      zone: this.rootDomain.hostedZone,
      certificate: this.certificate,
      recordNames: [this.baseDomainName],
    });
  }

  delegateSubDomain(subdomain: Domain): route53.ZoneDelegationRecord {
    return new route53.ZoneDelegationRecord(
      this,
      `ZoneDelegationRecord-${subdomain.hostedZone.zoneName}`,
      {
        zone: this.rootDomain.hostedZone,
        recordName: subdomain.hostedZone.zoneName,
        nameServers: subdomain.hostedZone.hostedZoneNameServers!,
      }
    );
  }
}
