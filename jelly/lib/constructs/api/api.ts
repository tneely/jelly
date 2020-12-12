import { Construct } from "aws-cdk-lib";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { AuthorizationMode, AuthorizationType, GraphqlApi } from "aws-cdk-lib/lib/aws-appsync";
import { Optional } from "../../util/types";
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
  userPool?: UserPool;
}

/**
 * A Construct to create and deploy the application's API
 */
export class Api extends GraphqlApi {
  constructor(scope: Construct, props: ApiProps) {
    super(scope, "Api", {
      name: "JellyApi",
      authorizationConfig: {
        defaultAuthorization: renderAuthorization(props.userPool),
      },
    });

    // TODO: Support custom domain?
  }
}

const renderAuthorization = (userPool?: UserPool): Optional<AuthorizationMode> => {
  return userPool
    ? {
        authorizationType: AuthorizationType.USER_POOL,
        userPoolConfig: {
          userPool: userPool,
        },
      }
    : undefined;
};
