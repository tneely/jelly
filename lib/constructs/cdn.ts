import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as routeAlias from "@aws-cdk/aws-route53-targets";
import { Routing } from "./routing";

export interface CdnProps {
  readonly siteBucket: s3.IBucket;
  readonly siteBucketKey: string;
  readonly domainName?: string;
}

/**
 * A CloudFormation stack for content delivery constructs
 */
export class Cdn extends cdk.Construct {
  public readonly distributionBucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;
  public readonly routing?: Routing;

  constructor(scope: cdk.Construct, props: CdnProps) {
    super(scope, "Cdn");

    if (props.domainName) {
      this.routing = new Routing(this, {
        domainName: props.domainName,
      });
    }

    // Set up S3 bucket and Cloudfront distribution to serve website content
    this.distributionBucket = new s3.Bucket(this, "WebsiteBucket", {
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
    });
    this.distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      defaultBehavior: {
        origin: cloudfront.Origin.fromBucket(this.distributionBucket),
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      certificate: this.routing?.certificate,
    });

    // FIXME: The new Distribution resource doesn't set SslSupportMethod when a
    // certificate is set, causing the deployment to fail (each requires the other)
    if (this.routing?.certificate) {
      const cfnDistribution = this.distribution.node.children[1] as cloudfront.CfnDistribution;
      cfnDistribution.distributionConfig = {
        ...cfnDistribution.distributionConfig,
        viewerCertificate: {
          ...(cfnDistribution.distributionConfig as cloudfront.CfnDistribution.DistributionConfigProperty)
            .viewerCertificate,
          sslSupportMethod: "sni-only",
          minimumProtocolVersion: "TLSv1",
        },
      };
    }

    this.routing?.addAliasTarget(
      new routeAlias.CloudFrontTarget(
        // TODO: Remove casting once CloudFrontTarget supports IDistribution
        (this.distribution as any) as cloudfront.CloudFrontWebDistribution
      )
    );

    new s3deploy.BucketDeployment(this, "DeployWithInvalidation", {
      sources: [s3deploy.Source.bucket(props.siteBucket, props.siteBucketKey)],
      destinationBucket: this.distributionBucket,
      distribution: this.distribution,
    });
  }
}
