import * as cdk from "@aws-cdk/core";
import { RootDomain } from "./root-domain";
import { Domain } from "./domain";

export interface RoutingProps {
  /**
   * The root domain name
   */
  domainName: string;

  /**
   * Subdomain prefix to use for the API
   *
   * @default "api"
   */
  apiSubdomainPrefix?: string;

  /**
   * Subdomain prefix to use for authentication
   *
   * @default "auth"
   */
  authSubdomainPrefix?: string;
}

/**
 * A Construct to create and manage the application's custom domains
 */
export class Routing extends cdk.Construct {
  public readonly rootDomain: RootDomain;
  public readonly apiDomain: Domain;
  public readonly authDomain: Domain;

  constructor(scope: cdk.Construct, props: RoutingProps) {
    super(scope, "Routing");

    const apiSubDomainPrefix = props.apiSubdomainPrefix ?? "api";
    const authSubDomainPrefix = props.authSubdomainPrefix ?? "auth";

    this.rootDomain = new RootDomain(this, { domainName: props.domainName });
    this.apiDomain = new Domain(this, "ApiDomain", {
      domainName: `${apiSubDomainPrefix}.${props.domainName}`,
    });
    this.authDomain = new Domain(this, "AuthDomain", {
      domainName: `${authSubDomainPrefix}.${props.domainName}`,
    });

    this.rootDomain.delegateSubDomain(this.apiDomain);
    this.rootDomain.delegateSubDomain(this.authDomain);
  }
}
