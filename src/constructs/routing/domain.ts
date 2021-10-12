import { Construct } from "monocdk";
import { HostedZone, PublicHostedZone, IAliasRecordTarget, ARecord, RecordTarget } from "monocdk/aws-route53";

export interface DomainProps {
  /**
   * The domain name to create in Route53
   */
  domainName: string;
}

/**
 * A Construct to create and host the application's custom domain
 */
export class Domain extends Construct {
  public readonly hostedZone: HostedZone;
  public readonly name: string;

  constructor(scope: Construct, id: string, props: DomainProps) {
    super(scope, id);

    this.name = props.domainName;
    this.hostedZone = new PublicHostedZone(this, "HostedZone", {
      zoneName: props.domainName,
    });
  }

  addAliasTarget(aliasTarget: IAliasRecordTarget): ARecord {
    return new ARecord(this, "AliasRecord", {
      zone: this.hostedZone,
      recordName: this.name,
      target: RecordTarget.fromAlias(aliasTarget),
    });
  }
}
