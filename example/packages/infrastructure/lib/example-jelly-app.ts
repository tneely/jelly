import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import { Jelly } from "cdk-jelly";

export interface ExampleJellyAppProps extends cdk.StageProps {
  readonly apiBucketName: string;
  readonly apiBucketKey: string;
  readonly siteBucketName: string;
  readonly siteBucketKey: string;
}

export class ExampleJellyApp extends cdk.Stage {
  constructor(scope: cdk.Construct, id: string, props: ExampleJellyAppProps) {
    super(scope, id, props);

    const apiBucket = s3.Bucket.fromBucketName(this, "ApiBucket", props.apiBucketName);
    const siteBucket = s3.Bucket.fromBucketName(this, "SiteBucket", props.siteBucketName);

    new Jelly(this, {
      appName: "ExampleJellyApp",
      apiBucket,
      apiBucketKey: props.apiBucketKey,
      siteBucket,
      siteBucketKey: props.siteBucketKey,
    });
  }
}
