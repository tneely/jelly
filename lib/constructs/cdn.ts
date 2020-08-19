import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as cloudfront_origins from "@aws-cdk/aws-cloudfront-origins";
import * as lambda from "@aws-cdk/aws-lambda";
import * as routeAlias from "@aws-cdk/aws-route53-targets";
import * as path from "path";
import { Routing } from "./routing";
import { ErrorResponse } from "@aws-cdk/aws-cloudfront";

export interface ClientOptions {
  /**
   * The source code to distribute
   */
  source: s3deploy.ISource;
  /**
   * Content Security Policy to use for the website
   *
   * Jelly uses Lambda@Edge to add the security headers.
   * These are largely follow best practices, and cannot be changed,
   * but it is highly recommended to customize the CSP,
   * or else you're going to have a hard time.
   *
   * @default "default-src 'self'"
   */
  contentSecurityPolicy?: string;
  /**
   * Whether to serve the website as a SPA
   *
   * If true, 404 error responses will return "/index.html" and a 200 response code
   *
   * @default true
   */
  isSPA?: boolean;
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
        // FIXME: Set custom origin header "x-env-csp" to props.contentSecurityPolicy ?? "default-src 'self'"
        origin: new cloudfront_origins.S3Origin(this.distributionBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        edgeLambdas: this.renderEdgeLambdas(),
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      certificate: props.routing?.rootDomain.certificate,
      errorResponses: this.renderResponseBehavior(props.isSPA),
    });

    // FIXME: The new Distribution doesn't allow domain names to be set. These are needed to route properly
    if (props.routing) {
      const rootDomainName = props.routing.rootDomain.name;
      const cfnDistribution = this.distribution.node.defaultChild as cloudfront.CfnDistribution;
      const distributionConfig = cfnDistribution.distributionConfig as cloudfront.CfnDistribution.DistributionConfigProperty;
      cfnDistribution.distributionConfig = {
        ...distributionConfig,
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

  private renderEdgeLambdas(): cloudfront.EdgeLambda[] {
    const headerHandler = new lambda.Function(this, "HeaderHandler", {
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda/authentication")),
      runtime: lambda.Runtime.NODEJS_12_X,
    });

    return [
      {
        functionVersion: headerHandler.currentVersion,
        eventType: cloudfront.LambdaEdgeEventType.ORIGIN_RESPONSE,
      },
    ];
  }

  private renderResponseBehavior(isSPA?: boolean): ErrorResponse[] {
    if (isSPA === false) {
      return [];
    }

    return [
      {
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: "/index.html",
      },
    ];
  }
}
