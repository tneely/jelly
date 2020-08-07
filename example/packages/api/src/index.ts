import { APIGatewayProxyHandler } from "aws-lambda";
import { handleMessages } from "./handle-messages";

// TODO: restrict CORS?

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  console.log(JSON.stringify(event));
  if (event.httpMethod == "OPTIONS") {
    return {
      statusCode: 204,
      body: "",
      isBase64Encoded: false,
      headers: {
        Allow: "OPTIONS, GET, POST",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
    };
  }

  const route = event.pathParameters?.proxy;
  switch (route) {
    case "messages":
      const payload = await handleMessages(event);
      return buildResponse(payload);
    default:
      throw new Error(`Unsupported path: ${route}`);
  }
};

const buildResponse = (body: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify(body),
    isBase64Encoded: false,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };
};
