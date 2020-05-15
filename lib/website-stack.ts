import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as cognito from "@aws-cdk/aws-cognito";
import * as config from "../config/app-config.json";
import * as cloudfront from "@aws-cdk/aws-cloudfront";

export interface WebsiteStackProps extends cdk.StackProps {}

export class WebsiteStack extends cdk.Stack {
  public readonly siteBucket: s3.Bucket;
  public readonly distribution: cloudfront.CloudFrontWebDistribution;
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  // TODO: break cloudfront, auth, etc. into their own stacks
  constructor(app: cdk.App, id: string, props?: WebsiteStackProps) {
    super(app, id, props);

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
    // TODO: set up custom domain name, enable ssl

    // Set up Cognito user pool and client to authenticate users
    this.userPool = new cognito.UserPool(this, "WebsiteUserPool", {
      userPoolName: `${config.appName}UserPool`,
      selfSignUpEnabled: true,
      requiredAttributes: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        requireSymbols: false,
      },
    });
    this.userPoolClient = new cognito.UserPoolClient(
      this,
      "WebsiteUserPoolClient",
      {
        userPool: this.userPool,
        userPoolClientName: config.appName,
        // TODO: support OAuth flows?
      }
    );

    // Set up database to store user data
    // TODO: Can the website define the database schema, and we import it here?

    // Set up API gateway to process user requests
    // TODO: Can the website define the API schema, and we import it here?
  }
}
