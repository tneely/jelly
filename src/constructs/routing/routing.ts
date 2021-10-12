import { Construct } from "monocdk";
import { Domain } from "./domain";
import { RootDomain } from "./root-domain";

export interface RoutingOptions {
  /**
   * The base domain name (e.g. "example.com")
   */
  baseDomainName: string;

  /**
   * Subdomain to use for the API (e.g. "api" for api.example.com)
   *
   * @default "api"
   */
  apiSubdomain?: string;

  /**
   * Subdomain to use for authentication (e.g. "auth" for auth.example.com)
   *
   * @default "auth"
   */
  authSubdomain?: string;
}

export type RoutingProps = RoutingOptions;

/**
 * A Construct to create and manage the application's custom domains
 */
export class Routing extends Construct {
  public readonly rootDomain: RootDomain;
  public readonly apiDomain: Domain;
  public readonly authDomain: Domain;

  constructor(scope: Construct, props: RoutingProps) {
    super(scope, "Routing");

    const apiSubDomainPrefix = props.apiSubdomain ?? "api";
    const authSubDomainPrefix = props.authSubdomain ?? "auth";

    this.rootDomain = new RootDomain(this, {
      baseDomainName: props.baseDomainName,
    });
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
