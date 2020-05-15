#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import * as config from "../config/app-config.json";
import { PipelineStack } from "../lib/pipeline-stack";
import { WebsiteStack } from "../lib/website-stack";

const app = new cdk.App();
const siteStack = new WebsiteStack(app, `${config.appName}WebsiteStack`);
new PipelineStack(app, `${config.appName}PipelineStack`, {
  siteBucket: siteStack.siteBucket,
  distribution: siteStack.distribution,
  userPool: siteStack.userPool,
  userPoolClient: siteStack.userPoolClient,
});
