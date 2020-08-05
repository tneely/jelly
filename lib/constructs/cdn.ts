import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as cloudfront_origins from "@aws-cdk/aws-cloudfront-origins";
import * as routeAlias from "@aws-cdk/aws-route53-targets";
import { Routing } from "./routing";

export interface CdnProps {
  source: s3deploy.ISource;
  routing?: Routing;
}

/**
 * A CloudFormation stack for content delivery constructs
 */
export class Cdn extends cdk.Construct {
  public readonly distributionBucket: s3.IBucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: cdk.Construct, props: CdnProps) {
    super(scope, "Cdn");

    // Set up S3 bucket and Cloudfront distribution to serve website content
    this.distributionBucket = new s3.Bucket(this, "WebsiteBucket", {
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
    });
    this.distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      defaultBehavior: {
        origin: new cloudfront_origins.S3Origin(this.distributionBucket),
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      certificate: props.routing?.rootDomain.certificate,
    });

    // FIXME: The new Distribution doesn't allow domain names to be set. These are needed to route properly
    // We also can't redirect to HTTPS from the existing distribution options
    if (props.routing) {
      const rootDomainName = props.routing.rootDomain.name;
      const cfnDistribution = this.distribution.node.children[1] as any;
      cfnDistribution.distributionConfig = {
        ...cfnDistribution.distributionConfig,
        aliases: [rootDomainName, `www.${rootDomainName}`],
        defaultCacheBehavior: {
          ...cfnDistribution.distributionConfig.defaultCacheBehavior,
          viewerProtocolPolicy: "redirect-to-https",
        },
      };
    }
    props.routing?.rootDomain.addAliasTarget(new routeAlias.CloudFrontTarget(this.distribution));

    new s3deploy.BucketDeployment(this, "DeployWithInvalidation", {
      sources: [props.source],
      destinationBucket: this.distributionBucket,
      distribution: this.distribution,
    });
  }
}
