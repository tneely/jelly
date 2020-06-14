import { Construct, Tag } from "@aws-cdk/core";
import { RepositoryDetails } from "./shapes/repository-details";
import {
  AuthStack,
  DataStack,
  DistributionStack,
  RoutingStack,
  PipelineStack,
  ApiGatewayStack,
  ApiStack,
} from "./stacks";

export interface JellyProps {
  readonly appName: string;
  readonly repositoryApiKey: string;
  readonly infrastructureRepository: RepositoryDetails;
  readonly applicationRepository: RepositoryDetails;
}

export class Jelly extends Construct {
  public readonly authStack: AuthStack;
  public readonly dataStack: DataStack;
  public readonly distributionStack: DistributionStack;
  public readonly apiGatewayStack: ApiGatewayStack;
  public readonly routingStack: RoutingStack;
  public readonly pipelineStack: PipelineStack;
  public readonly apiStack: ApiStack;

  constructor(scope: Construct, props: JellyProps) {
    super(scope, `Jelly-${props.appName}`);
    this.authStack = new AuthStack(this, { appName: props.appName });
    this.dataStack = new DataStack(this);
    this.distributionStack = new DistributionStack(this);
    this.apiGatewayStack = new ApiGatewayStack(this, { appName: props.appName });
    this.routingStack = new RoutingStack(this);
    this.apiStack = new ApiStack(this, {
      apiGateway: this.apiGatewayStack.api,
      database: this.dataStack.table,
    });
    this.pipelineStack = new PipelineStack(this, {
      appName: props.appName,
      repoApiKey: props.repositoryApiKey,
      cdkRepo: props.infrastructureRepository,
      appRepo: props.applicationRepository,
      stacks: {
        authStack: this.authStack,
        dataStack: this.dataStack,
        distributionStack: this.distributionStack,
        apiGatewayStack: this.apiGatewayStack,
        routingStack: this.routingStack,
        apiStack: this.apiStack,
      },
    });

    Tag.add(this, "app", props.appName);
  }
}
