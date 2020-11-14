import * as cdk from "@aws-cdk/core";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import { Jelly } from "cdk-jelly";
import { dirname } from "path";
import { ApiStack } from "./api-stack";

export interface ExampleJellyAppProps extends cdk.StageProps {}

export class ExampleJellyApp extends cdk.Stage {
  constructor(scope: cdk.Construct, id: string, props?: ExampleJellyAppProps) {
    super(scope, id, props);

    const jelly = new Jelly(this, {
      client: {
        source: s3deploy.Source.asset(dirname(require.resolve("example-app"))),
        httpHeaders: {
          contentSecurityPolicy:
            "default-src 'self' *.cdk-jelly.com; object-src 'none'; require-trusted-types-for 'script'; img-src *; font-src fonts.gstatic.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; connect-src https:",
        },
      },
      routing: {
        baseDomainName: "cdk-jelly.com",
      },
    });

    new ApiStack(this, {
      api: jelly.api,
    });
  }
}
