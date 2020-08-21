import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import { EdgeFunction } from "./edge-function";

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
}

export interface HttpHeadersProps extends HttpHeaderOptions {}

export class HttpHeaders extends EdgeFunction {
  constructor(scope: cdk.Construct, id: string, props: HttpHeadersProps) {
    super(scope, id, {
      handler: "index.handler",
      code: lambda.Code.fromInline(renderCode(props)),
      runtime: lambda.Runtime.NODEJS_12_X,
      eventType: cloudfront.LambdaEdgeEventType.ORIGIN_RESPONSE,
    });
  }
}

const renderCode = (headerOptions: HttpHeaderOptions): string => {
  const strictTransportSecurity =
    headerOptions.strictTransportSecurity ?? "max-age=63072000; includeSubDomains; preload";
  const xContentTypeOptions = headerOptions.xContentTypeOptions ?? "nosniff";
  const xXssProtection = headerOptions.xContentTypeOptions ?? "1; mode=block";
  const xFrameOptions = headerOptions.xContentTypeOptions ?? "DENY";
  const referrerPolicy = headerOptions.xContentTypeOptions ?? "strict-origin-when-cross-origin";
  const featurePolicy =
    headerOptions.xContentTypeOptions ?? "microphone 'self'; geolocation 'self'; camera 'self'";
  const contentSecurityPolicy = headerOptions.xContentTypeOptions ?? "default-src 'self'";

  return `const addHeader = (headers, key, value) => {
        headers[key.toLowerCase()] = [
            {
                key,
                value,
            },
        ];
    };
    
    export const handler = async (event, _context) => {
        const request = event.Records[0].cf.request;
        const response = event.Records[0].cf.response;
        const headers = response.headers;
        // Enforce HSTS
        addHeader(headers, "Strict-Transport-Security", ${strictTransportSecurity});
        // Reduce XSS risks
        addHeader(headers, "X-Content-Type-Options", ${xContentTypeOptions});
        addHeader(headers, "X-XSS-Protection", ${xXssProtection});
        addHeader(headers, "X-Frame-Options", ${xFrameOptions});
        // Reduce referrer information
        addHeader(headers, "Referrer-Policy", ${referrerPolicy});
        // Limit some feature use to same origin
        addHeader(headers, "Feature-Policy", ${featurePolicy});
        // Add custom content security policy
        addHeader(headers, "Content-Security-Policy", ${contentSecurityPolicy});
        return response;
    };
    `;
};
