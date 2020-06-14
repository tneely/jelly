#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import secrets from "../config/secrets";
import { Jelly } from "../lib/jelly";
import { RepositoryType } from "../lib/shapes/repository-details";

const app = new cdk.App();
new Jelly(app, {
  appName: "FitJournal",
  repositoryApiKey: secrets.repositoryApiKey!,
  applicationRepository: {
    owner: "tneely",
    repo: "jelly-example-app",
    type: RepositoryType.GITHUB,
  },
  infrastructureRepository: {
    owner: "tneely",
    repo: "jelly",
    type: RepositoryType.GITHUB,
  },
});
