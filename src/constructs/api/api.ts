import { Construct } from "monocdk";
import { DomainMappingOptions, DomainName, HttpApi, IHttpRouteAuthorizer, IHttpStage } from "monocdk/aws-apigatewayv2";
import { HttpUserPoolAuthorizer } from "monocdk/aws-apigatewayv2-authorizers";
import { Table, TableProps } from "monocdk/aws-dynamodb";
import { Optional } from "../../util/types";
import { Auth } from "../auth";
import { Routing } from "../routing";

export interface ApiProps {
  /**
   * Routing to use for custom domains
   *
   * If present, the RestApi will be aliased to the API domain name
   *
   * @default - The API will not use a custom domain name
   */
  routing?: Routing;
  /**
   * Authorization to use for the API
   */
  auth?: Auth;
}

/**
 * A Construct to create and deploy the application's API
 */
export class Api extends HttpApi {
  /**
   * The default stage of this API.
   */
  public readonly defaultStage: IHttpStage;
  /**
   * Authorizer that uses a Cognito user pool and client to control access.
   */
  public readonly userAuthorizer?: IHttpRouteAuthorizer;

  constructor(scope: Construct, props: ApiProps) {
    super(scope, "Api", {
      createDefaultStage: false,
      disableExecuteApiEndpoint: props.routing ? true : false,
    });

    this.defaultStage = this.addStage("DefaultStage", {
      domainMapping: this.renderDomainMapping(props.routing),
    });
    this.userAuthorizer = this.renderAuthorizer(props.auth);
  }

  private renderDomainMapping(routing?: Routing): Optional<DomainMappingOptions> {
    if (!routing) {
      return undefined;
    }
    return {
      domainName: new DomainName(this, "Domain", {
        domainName: routing.apiDomain.name,
        certificate: routing.rootDomain.certificate,
      }),
    };
  }

  private renderAuthorizer(auth: Auth): Optional<IHttpRouteAuthorizer> {
    if (!auth) {
      return undefined;
    }
    return new HttpUserPoolAuthorizer({ userPool: auth.userPool, userPoolClient: auth.userPoolClient });
  }

  public addTable(name: string, props: TableProps): Table {
    return new Table(this, name, props);
  }
}
