import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify(event, null, 2),
    isBase64Encoded: false,
  };
};
