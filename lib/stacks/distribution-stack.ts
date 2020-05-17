import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as cloudfront from "@aws-cdk/aws-cloudfront";

export interface DistributionStackProps extends cdk.StackProps {}

/**
 * A CloudFormation stack for distribution constructs
 */
export class DistributionStack extends cdk.Stack {
  public readonly siteBucket: s3.Bucket;
  public readonly distribution: cloudfront.CloudFrontWebDistribution;

  constructor(app: cdk.App, appName: string, props?: DistributionStackProps) {
    super(app, `${appName}DistributionStack`, props);

    // Set up S3 bucket and Cloudfront distribution to serve website content
    this.siteBucket = new s3.Bucket(this, "WebsiteBucket", {
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
    });
    this.distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "SiteDistribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: this.siteBucket,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
        errorConfigurations: [
          {
            // Route errors back to index - let React handle the error page
            // TODO: Make this flexible so that we can support non-react sites
            errorCode: 403,
            responseCode: 200,
            responsePagePath: "/index.html",
          },
        ],
      }
    );
  }
}
