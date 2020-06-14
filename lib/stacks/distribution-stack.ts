import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as cloudfront from "@aws-cdk/aws-cloudfront";

export interface DistributionStackProps extends cdk.StackProps {
  /**
   * How to respond to a 403/404 error
   */
  errorConfig?: {
    /**
     * @default 200
     */
    responseCode?: number;
    /**
     * @default "/index.html"
     */
    responsePath?: string;
  };
}

/**
 * A CloudFormation stack for content delivery constructs
 */
export class DistributionStack extends cdk.Stack {
  public readonly siteBucket: s3.Bucket;
  public readonly distribution: cloudfront.CloudFrontWebDistribution;

  constructor(scope: cdk.Construct, props?: DistributionStackProps) {
    super(scope, "DistributionStack", props);

    const errorResponseCode = props?.errorConfig?.responseCode || 200;
    const errorResponsePath = props?.errorConfig?.responsePath || "/index.html";

    // Set up S3 bucket and Cloudfront distribution to serve website content
    this.siteBucket = new s3.Bucket(this, "WebsiteBucket", {
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
    });
    this.distribution = new cloudfront.CloudFrontWebDistribution(this, "SiteDistribution", {
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
          // Cloudfront responds with a 403 if the user doesn’t have s3:ListBucket permissions
          errorCode: 403,
          responseCode: errorResponseCode,
          responsePagePath: errorResponsePath,
        },
        {
          errorCode: 404,
          responseCode: errorResponseCode,
          responsePagePath: errorResponsePath,
        },
      ],
    });
  }
}
