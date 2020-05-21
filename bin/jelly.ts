#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import * as config from "../config/app-config.json";
import secrets from "../config/secrets";
import { GithubDetails } from "../lib/shapes/github-details";
import { DistributionStack } from "../lib/stacks/distribution-stack";
import { AuthStack } from "../lib/stacks/auth-stack";
import { DataStack } from "../lib/stacks/data-stack";
import { ApiStack } from "../lib/stacks/api-stack";
import { RoutingStack } from "../lib/stacks/routing-stack";
import { ApplicationPipelineStack } from "../lib/stacks/application-pipeline/application-pipeline-stack";
import { InfrastructurePipelineStack } from "../lib/stacks/infrastructure-stack/infrastructure-pipeline-stack";
import { StackDetails } from "../lib/shapes/stack-details";

const validateConfig = () => {
  if (secrets.githubKey == undefined) {
    throw Error(
      "No API key found for GitHub. Please set the environment variable 'GITHUB_API_KEY' to continue."
    );
  }
};

const createApplicationStacks = (
  app: cdk.App,
  appName: string,
  github: GithubDetails
): StackDetails[] => {
  const distributionStack = new DistributionStack(app, appName);
  const authStack = new AuthStack(app, appName);
  const dataStack = new DataStack(app, appName);
  const apiStack = new ApiStack(app, appName, {
    database: dataStack.table,
  });
  const routingStack = new RoutingStack(app, appName);
  const pipelineStack = new ApplicationPipelineStack(app, appName, {
    github: github,
    siteBucket: distributionStack.siteBucket,
    distribution: distributionStack.distribution,
    userPool: authStack.userPool,
    userPoolClient: authStack.userPoolClient,
    database: dataStack.table,
    apiBucket: apiStack.handlerCodeBucket,
  });

  return [
    {
      stack: distributionStack,
      priority: 1,
    },
    {
      stack: authStack,
      priority: 1,
    },
    {
      stack: dataStack,
      priority: 1,
    },
    {
      stack: apiStack,
      priority: 2,
    },
    {
      stack: routingStack,
      // priority: ???
    },
    {
      stack: pipelineStack,
      priority: 998,
    },
  ];
};

const createAllStacks = (app: cdk.App, appName: string, github: GithubDetails) => {
  validateConfig();

  const appStacks = createApplicationStacks(jelly, config.appName, {
    ...config.github,
    key: secrets.githubKey!,
  });

  new InfrastructurePipelineStack(app, appName, {
    // TODO: Make this configurable?
    github: { owner: "tneely", repo: "jelly", key: secrets.githubKey! },
    appStacks: appStacks,
  });
};

const jelly = new cdk.App();
createAllStacks(jelly, config.appName, { ...config.github, key: secrets.githubKey! });
