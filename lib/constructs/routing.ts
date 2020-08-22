import * as cdk from "@aws-cdk/core";
import { Domain } from "./domain";
import { RootDomain } from "./root-domain";

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
  public readonly rootDomain: RootDomain;
  public readonly apiDomain: Domain;
  public readonly authDomain: Domain;

  constructor(scope: cdk.Construct, props: RoutingProps) {
    super(scope, "Routing");

    const apiSubDomainPrefix = props.apiSubdomainPrefix ?? "api";
    const authSubDomainPrefix = props.authSubdomainPrefix ?? "auth";

    this.rootDomain = new RootDomain(this, { baseDomainName: props.baseDomainName });
    this.apiDomain = new Domain(this, "ApiDomain", {
      domainName: `${apiSubDomainPrefix}.${props.baseDomainName}`,
    });
    this.authDomain = new Domain(this, "AuthDomain", {
      domainName: `${authSubDomainPrefix}.${props.baseDomainName}`,
    });

    this.rootDomain.delegateSubDomain(this.apiDomain);
    this.rootDomain.delegateSubDomain(this.authDomain);
  }
}
