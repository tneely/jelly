#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import * as config from "../config/app-config.json";
import secrets from "../config/secrets";
import { GithubDetails } from "../lib/shapes/github-details";
import {
  DistributionStack,
  AuthStack,
  ApiStack,
  DataStack,
  RoutingStack,
  PipelineStack,
} from "../lib/stacks";

const validateConfig = () => {
  if (secrets.githubKey == undefined) {
    throw Error(
      "No API key found for GitHub. Please set the environment variable 'GITHUB_API_KEY' to continue."
    );
  }
};

const createStacks = (app: cdk.App, appName: string, appGithub: GithubDetails, apiKey: string) => {
  validateConfig();

  const authStack = new AuthStack(app, appName);
  const dataStack = new DataStack(app, appName);
  const distributionStack = new DistributionStack(app, appName);

  const apiStack = new ApiStack(app, appName, {
    database: dataStack.table,
  });
  const routingStack = new RoutingStack(app, appName);

  new PipelineStack(app, appName, {
    apiKey: apiKey,
    // TODO: Make this configurable?
    cdkGithub: { owner: "tneely", repo: "jelly" },
    appGithub: appGithub,
    authStack: authStack,
    dataStack: dataStack,
    distributionStack: distributionStack,
    apiStack: apiStack,
    routingStack: routingStack,
  });
};

const jelly = new cdk.App();
createStacks(jelly, config.appName, config.github, secrets.githubKey!);
