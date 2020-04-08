#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { InfrastructureStack } from "../lib/infrastructure-stack";
import * as config from "../config/app-config.json";

const app = new cdk.App();
new InfrastructureStack(app, `${config.appName}Stack`);
