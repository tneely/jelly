#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import * as config from "../config/app-config.json";
import { PipelineStack } from "../lib/stacks/pipeline-stack";
import { DistributionStack } from "../lib/stacks/distribution-stack";
import { AuthStack } from "../lib/stacks/auth-stack";
import { DataStack } from "../lib/stacks/data-stack";
import { ApiStack } from "../lib/stacks/api-stack";
import { RoutingStack } from "../lib/stacks/routing-stack";

const app = new cdk.App();
const distributionStack = new DistributionStack(app, config.appName);
const authStack = new AuthStack(app, config.appName);
const dataStack = new DataStack(app, config.appName);
const apiStack = new ApiStack(app, config.appName);
const routingStack = new RoutingStack(app, config.appName);
const pipelineStack = new PipelineStack(app, `${config.appName}PipelineStack`, {
  siteBucket: distributionStack.siteBucket,
  distribution: distributionStack.distribution,
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
});
