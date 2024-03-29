import { Stack, StackProps, Construct } from "monocdk";
import { Api, Authentication, Cdn, Routing } from "./constructs";
import { ClientOptions } from "./constructs/client";
import { RoutingOptions } from "./constructs/routing";

export interface JellyProps extends StackProps {
  /**
   * Properties related to the web client
   */
  client: ClientOptions;

  /**
   * Domain routing
   *
   * @default - No routing will be done
   */
  routing?: RoutingOptions;

  /**
   * Whether Cognito-based user authentication will be set up to help control API access
   *
   * @default true
   */
  withUserAuthentication?: boolean;
}

export class Jelly extends Stack {
  public readonly api: Api;
  public readonly cdn: Cdn;
  public readonly auth?: Authentication;
  public readonly routing?: Routing;

  constructor(scope: Construct, props: JellyProps) {
    super(scope, "Jelly", props);

    if (props.routing) {
      this.routing = new Routing(this, {
        ...props.routing,
      });
    }

    this.cdn = new Cdn(this, {
      ...props.client,
      routing: this.routing,
    });

    if (props.withUserAuthentication ?? true) {
      this.auth = new Authentication(this, {
        routing: this.routing,
      });

      // Dependency needed so that alias exists on root domain before auth domain created
      // (userPool.addDomain throws a fit otherwise during initial CFn deployment)
      if (this.routing) this.auth.node.addDependency(this.cdn);
    }

    this.api = new Api(this, {
      routing: this.routing,
      auth: this.auth,
    });
  }
}
