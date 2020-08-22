import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as cloudfront_origins from "@aws-cdk/aws-cloudfront-origins";
import * as routeAlias from "@aws-cdk/aws-route53-targets";
import { Routing } from "./routing";
import { ErrorResponse } from "@aws-cdk/aws-cloudfront";
import { HttpHeaderOptions, HttpHeaders } from "./http-headers";

export interface ClientOptions {
  /**
   * The source code to distribute
   */
  source: s3deploy.ISource;
  /**
   * Additional HTTP headers to use for the website
   *
   * Jelly uses Lambda@Edge to add the security headers.
   * These are largely follow best practices, but it is highly
   * recommended to customize the Content Security Policy,
   * or else you're going to have a hard time.
   *
   * @default - Defaults defined in HttpHeadersProps
   */
  httpHeaders?: HttpHeaderOptions;
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
        origin: new cloudfront_origins.S3Origin(this.distributionBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        edgeLambdas: this.renderEdgeLambdas(props.httpHeaders),
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      certificate: props.routing?.rootDomain.certificate,
      domainNames: this.renderDomainNames(props.routing),
      errorResponses: this.renderResponseBehavior(props.isSPA),
    });

    props.routing?.rootDomain.addAliasTarget(new routeAlias.CloudFrontTarget(this.distribution));

    new s3deploy.BucketDeployment(this, "DeployWithInvalidation", {
      sources: [props.source],
      destinationBucket: this.distributionBucket,
      distribution: this.distribution,
    });
  }

  private renderDomainNames(routing?: Routing): string[] {
    const rootDomainName = routing?.rootDomain.name;
    return rootDomainName ? [rootDomainName] : [];
  }

  private renderEdgeLambdas(httpHeaders?: HttpHeaderOptions): cloudfront.EdgeLambda[] {
    return [new HttpHeaders(this, "HttpHeaders", { ...httpHeaders })];
  }

  private renderResponseBehavior(isSPA?: boolean): ErrorResponse[] {
    return isSPA ?? true
      ? [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
          },
        ]
      : [];
  }
}
