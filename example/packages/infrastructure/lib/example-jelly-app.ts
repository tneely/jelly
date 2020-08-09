import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
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
      },
      routing: {
        domainName: "cdk-jelly.com",
      },
    });
  }
}
