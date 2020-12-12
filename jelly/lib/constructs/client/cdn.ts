import { Construct } from "aws-cdk-lib";
import {
  Distribution,
  ViewerProtocolPolicy,
  PriceClass,
  EdgeLambda,
  ErrorResponse,
} from "aws-cdk-lib/lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/lib/aws-cloudfront-origins";
import { CloudFrontTarget } from "aws-cdk-lib/lib/aws-route53-targets";
import { IBucket, Bucket } from "aws-cdk-lib/lib/aws-s3";
import { BucketDeployment, ISource } from "aws-cdk-lib/lib/aws-s3-deployment";
import { Routing } from "../routing";
import { HttpHeaderOptions, HttpHeaders } from "./http-headers";

export interface ClientOptions {
  /**
   * The source code to distribute
   */
  source: ISource;
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
export class Cdn extends Construct {
  public readonly distributionBucket: IBucket;
  public readonly distribution: Distribution;

  constructor(scope: Construct, props: CdnProps) {
    super(scope, "Cdn");

    this.distributionBucket = new Bucket(this, "DistributionBucket", {
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
    });

    this.distribution = new Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: new S3Origin(this.distributionBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        edgeLambdas: this.renderEdgeLambdas(props.httpHeaders),
      },
      priceClass: PriceClass.PRICE_CLASS_100,
      certificate: props.routing?.rootDomain.certificate,
      domainNames: this.renderDomainNames(props.routing),
      errorResponses: this.renderResponseBehavior(props.isSPA),
    });

    props.routing?.rootDomain.addAliasTarget(new CloudFrontTarget(this.distribution));

    new BucketDeployment(this, "DeployWithInvalidation", {
      sources: [props.source],
      destinationBucket: this.distributionBucket,
      distribution: this.distribution,
    });
  }

  private renderDomainNames(routing?: Routing): string[] {
    const rootDomainName = routing?.rootDomain.name;
    return rootDomainName ? [rootDomainName] : [];
  }

  private renderEdgeLambdas(httpHeaders?: HttpHeaderOptions): EdgeLambda[] {
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
