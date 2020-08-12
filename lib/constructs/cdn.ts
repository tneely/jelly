import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as cloudfront_origins from "@aws-cdk/aws-cloudfront-origins";
import * as routeAlias from "@aws-cdk/aws-route53-targets";
import { Routing } from "./routing";

export interface ClientOptions {
  /**
   * The source code to distribute
   */
  source: s3deploy.ISource;
}

export interface CdnProps extends ClientOptions {
  /**
   * Routing to use for custom domains
   *
   * If present, the Distribution will be aliased to the app domain name
   *
   * @default - The Distribution will not use a custom domain name
   */
  routing?: Routing;
}

/**
 * A Construct to create and deploy the application's CDN
 */
export class Cdn extends cdk.Construct {
  public readonly distributionBucket: s3.IBucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: cdk.Construct, props: CdnProps) {
    super(scope, "Cdn");

    this.distributionBucket = new s3.Bucket(this, "DistributionBucket", {
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
    });

    this.distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: new cloudfront_origins.S3Origin(this.distributionBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      certificate: props.routing?.rootDomain.certificate,
    });

    // FIXME: The new Distribution doesn't allow domain names to be set. These are needed to route properly
    if (props.routing) {
      const rootDomainName = props.routing.rootDomain.name;
      const cfnDistribution = this.distribution.node.children[1] as any;
      cfnDistribution.distributionConfig = {
        ...cfnDistribution.distributionConfig,
        aliases: [rootDomainName, `www.${rootDomainName}`],
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
