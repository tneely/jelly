import { Construct } from "monocdk";
import { EdgeLambda, LambdaEdgeEventType } from "monocdk/aws-cloudfront";
import { Code, IVersion, Runtime } from "monocdk/aws-lambda";
import { EdgeFunction } from "monocdk/lib/aws-cloudfront/lib/experimental";

export interface HttpHeaderOptions {
  /**
   * placeholder
   *
   * @default "max-age=63072000; includeSubDomains; preload"
   */
  strictTransportSecurity?: string;

  /**
   * placeholder
   *
   * @default "nosniff"
   */

  xContentTypeOptions?: string;
  /**
   * placeholder
   *
   * @default "1; mode=block"
   */
  xXssProtection?: string;

  /**
   * placeholder
   *
   * @default "DENY"
   */
  xFrameOptions?: string;

  /**
   * placeholder
   *
   * @default "strict-origin-when-cross-origin"
   */
  referrerPolicy?: string;

  /**
   * placeholder
   *
   * @default "microphone 'self'; geolocation 'self'; camera 'self'"
   */
  featurePolicy?: string;

  /**
   * placeholder
   *
   * @default "default-src 'self'"
   */
  contentSecurityPolicy?: string;

  /**
   * placeholder
   *
   * @default "*"
   */
  accessControlAllowOrigin?: string;
}

export type HttpHeaderFunctionProps = HttpHeaderOptions;

export class HttpHeaderFunction extends EdgeFunction implements EdgeLambda {
  public readonly functionVersion: IVersion;
  public readonly eventType: LambdaEdgeEventType;

  constructor(scope: Construct, id: string, props: HttpHeaderFunctionProps) {
    super(scope, id, {
      handler: "index.handler",
      code: Code.fromInline(renderCode(props)),
      runtime: Runtime.NODEJS_12_X,
    });
    this.functionVersion = this.currentVersion;
    this.eventType = LambdaEdgeEventType.ORIGIN_RESPONSE;
  }
}

const renderCode = (headerOptions: HttpHeaderOptions): string => {
  const strictTransportSecurity =
    headerOptions.strictTransportSecurity ?? "max-age=63072000; includeSubDomains; preload";
  const xContentTypeOptions = headerOptions.xContentTypeOptions ?? "nosniff";
  const xXssProtection = headerOptions.xXssProtection ?? "1; mode=block";
  const xFrameOptions = headerOptions.xFrameOptions ?? "DENY";
  const referrerPolicy = headerOptions.referrerPolicy ?? "strict-origin-when-cross-origin";
  const featurePolicy = headerOptions.featurePolicy ?? "microphone 'self'; geolocation 'self'; camera 'self'";
  const contentSecurityPolicy = headerOptions.contentSecurityPolicy ?? "default-src 'self'";
  const accessControlAllowOrigin = headerOptions.accessControlAllowOrigin ?? "*";

  return `const addHeader = (headers, key, value) => {
        headers[key.toLowerCase()] = [
            {
                key,
                value,
            },
        ];
    };
    
    exports.handler = async (event, _context) => {
        const request = event.Records[0].cf.request;
        const response = event.Records[0].cf.response;
        const headers = response.headers;
        // Enforce HSTS
        addHeader(headers, "Strict-Transport-Security", "${strictTransportSecurity}");
        // Reduce XSS risks
        addHeader(headers, "X-Content-Type-Options", "${xContentTypeOptions}");
        addHeader(headers, "X-XSS-Protection", "${xXssProtection}");
        addHeader(headers, "X-Frame-Options", "${xFrameOptions}");
        // Reduce referrer information
        addHeader(headers, "Referrer-Policy", "${referrerPolicy}");
        // Limit some feature use to same origin
        addHeader(headers, "Feature-Policy", "${featurePolicy}");
        // Add custom content security policy
        addHeader(headers, "Content-Security-Policy", "${contentSecurityPolicy}");
        // Access control
        addHeader(headers, "Access-Control-Allow-Origin", "${accessControlAllowOrigin}");
        return response;
    };
    `;
};
