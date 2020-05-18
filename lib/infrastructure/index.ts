import * as cdk from "@aws-cdk/core";

export class JellyInfrastructure extends cdk.Construct {
  constructor(scope: cdk.Construct) {
    super(scope, "Jelly");

    // TODO: Self update pipeline and anything else we may need that's not directly related to the app
  }
}
