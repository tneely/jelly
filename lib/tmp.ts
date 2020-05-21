import * as cdk from "@aws-cdk/core";

import { GithubDetails } from "./shapes/github-details";
import { DistributionStack } from "./stacks/distribution-stack";
import { AuthStack } from "./stacks/auth-stack";
import { DataStack } from "./stacks/data-stack";
import { ApiStack } from "./stacks/api-stack";
import { RoutingStack } from "./stacks/routing-stack";
import { ApplicationPipelineStack } from "./stacks/application-pipeline/application-pipeline-stack";

export interface AppProps {
  appName: string;
  github: GithubDetails;
}

//TODO: Deploy from infrastructure pipeline and delete
export class App extends cdk.Construct {
  constructor(scope: cdk.Construct, props: AppProps) {
    super(scope, props.appName);

    const distributionStack = new DistributionStack(this, props.appName);
    const authStack = new AuthStack(this, props.appName);
    const dataStack = new DataStack(this, props.appName);
    const apiStack = new ApiStack(this, props.appName, {
      database: dataStack.table,
    });
    const routingStack = new RoutingStack(this, props.appName);
    const pipelineStack = new ApplicationPipelineStack(this, props.appName, {
      github: props.github,
      siteBucket: distributionStack.siteBucket,
      distribution: distributionStack.distribution,
      userPool: authStack.userPool,
      userPoolClient: authStack.userPoolClient,
      database: dataStack.table,
      apiBucket: apiStack.handlerCodeBucket,
    });
  }
}
