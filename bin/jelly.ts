#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import * as config from "../config/app-config.json";
import * as secrets from "../config/secrets.json";
import { AppInfrastructure } from "../lib/app";
import { JellyInfrastructure } from "../lib/infrastructure";

const jelly = new cdk.App();

// TODO: better names?
new AppInfrastructure(jelly, {
  appName: config.appName,
  github: { ...config.github, key: secrets.githubKey },
});
new JellyInfrastructure(jelly);
