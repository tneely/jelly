import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import { Jelly } from "cdk-jelly";

export interface ExampleJellyAppProps extends cdk.StageProps {}

export class ExampleJellyApp extends cdk.Stage {
  constructor(scope: cdk.Construct, id: string, props?: ExampleJellyAppProps) {
    super(scope, id, props);

    new Jelly(this, {
      appName: "ExampleJellyApp",
      api: {
        assetPath: "../api/dist",
      },
      app: {
        assetPath: "../app/build",
      },
      domain: {
        name: "cdk-jelly.com",
      },
    });
  }
}
