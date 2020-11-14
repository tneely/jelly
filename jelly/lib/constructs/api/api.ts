import * as cdk from "@aws-cdk/core";
import * as appsync from "@aws-cdk/aws-appsync";
import * as cognito from "@aws-cdk/aws-cognito";
import { Routing } from "../routing";

export interface ApiOptions {}

export interface ApiProps extends ApiOptions {
  /**
   * Routing to use for custom domains
   *
   * If present, the RestApi will be aliased to the API domain name
   *
   * @default - The API will not use a custom domain name
   */
  routing?: Routing;
  /**
   * Cognito User Pool to use for authorization
   *
   * @default - The API will use the AppSync default
   */
  userPool?: cognito.UserPool;
}

/**
 * A Construct to create and deploy the application's API
 */
export class Api extends appsync.GraphqlApi {
  constructor(scope: cdk.Construct, props: ApiProps) {
    super(scope, "Api", {
      name: "JellyApi",
      authorizationConfig: {
        defaultAuthorization: renderAuthorization(props.userPool),
      },
    });

    // TODO: Support custom domain?
  }
}

const renderAuthorization = (userPool?: cognito.UserPool): appsync.AuthorizationMode | undefined => {
  return userPool
    ? {
        authorizationType: appsync.AuthorizationType.USER_POOL,
        userPoolConfig: {
          userPool: userPool,
        },
      }
    : undefined;
};
