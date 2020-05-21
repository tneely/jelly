#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import * as config from "../config/app-config.json";
import * as secrets from "../config/secrets.json";
import { App } from "../lib/tmp";

const jelly = new cdk.App();

new App(jelly, {
  appName: config.appName,
  github: { ...config.github, key: secrets.githubKey },
});
