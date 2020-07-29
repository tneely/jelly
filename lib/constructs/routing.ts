import * as cdk from "@aws-cdk/core";
import { RootDomain } from "./root-domain";
import { Domain } from "./domain";

export interface RoutingProps {
  domainName: string;
  apiSubdomainPrefix?: string;
  authSubdomainPrefix?: string;
}

/**
 * A CloudFormation stack for routing constructs
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
