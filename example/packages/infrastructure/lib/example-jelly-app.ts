import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import { AttributeType } from "@aws-cdk/aws-dynamodb";
import { Jelly } from "cdk-jelly";

export interface ExampleJellyAppProps extends cdk.StageProps {}

export class ExampleJellyApp extends cdk.Stage {
  constructor(scope: cdk.Construct, id: string, props?: ExampleJellyAppProps) {
    super(scope, id, props);

    new Jelly(this, {
      api: {
        code: lambda.Code.fromAsset("../api/dist"),
      },
      client: {
        source: s3deploy.Source.asset("../app/build"),
        httpHeaders: {
          contentSecurityPolicy:
            "default-src 'self' *.cdk-jelly.com; object-src 'none'; require-trusted-types-for 'script'; img-src *; font-src fonts.gstatic.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; connect-src https:",
        },
      },
      routing: {
        baseDomainName: "cdk-jelly.com",
      },
      database: {
        tables: {
          DATABASE_NAME: {
            partitionKey: {
              name: "id",
              type: AttributeType.STRING,
            },
            sortKey: {
              name: "created",
              type: AttributeType.NUMBER,
            },
            timeToLiveAttribute: "ttl",
          },
        },
      },
    });
  }
}
