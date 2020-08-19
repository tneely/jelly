import { CloudFrontResponseHandler, CloudFrontHeaders } from "aws-lambda";

// Code modified from https://iangilham.com/2017/08/22/add-headers-with-lambda-edge.html
export const handler: CloudFrontResponseHandler = async (event, _context) => {
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  // HSTS cached for 2 years
  addHeader(headers, "Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  // Reduce XSS risks
  addHeader(headers, "X-Content-Type-Options", "nosniff");
  addHeader(headers, "X-XSS-Protection", "1; mode=block");
  addHeader(headers, "X-Frame-Options", "DENY");

  // Reduce referrer information
  addHeader(headers, "Referrer-Policy", "strict-origin-when-cross-origin");

  // Limit some feature use to same origin
  addHeader(headers, "Feature-Policy", "microphone 'self'; geolocation 'self'; camera 'self'");

  // Add custom content security policy
  addHeader(headers, "Content-Security-Policy", process.env.CONTENT_SECURITY_POLICY);

  return response;
};

const addHeader = (headers: CloudFrontHeaders, key: string, value: string): void => {
  headers[key.toLowerCase()] = [
    {
      key,
      value,
    },
  ];
};
