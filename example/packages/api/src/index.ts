import { APIGatewayProxyHandler, APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const dbName = process.env.DATABASE_NAME!;
const dbClient = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  const route = event.pathParameters?.proxy;
  switch (route) {
    case "messages":
      const payload = await handleMessages(event.httpMethod, event);
      return buildResponse(payload);
    default:
      throw new Error(`Unsupported path: ${route}`);
  }
};

const handleMessages = async (method: string, event: APIGatewayProxyEvent) => {
  switch (method) {
    case "GET":
      return getMessage();
    case "POST":
      return putMessage(event.body);
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
};

const getMessage = async () => {
  const items = await dbClient
    .query({
      TableName: dbName,
      KeyConditionExpression: "*",
      Limit: 10,
    })
    .promise();
  return items.Items;
};

const putMessage = async (payload: string | null) => {
  if (!payload || payload.length < 1) {
    throw new Error("Must specify a message");
  }

  const message = JSON.parse(payload).message;
  const now = new Date();
  await dbClient
    .put({
      TableName: dbName,
      Item: {
        id: generateId(now.toISOString()),
        epoch: now.getTime(),
        message: message.substr(0, 250),
      },
    })
    .promise();
};

const generateId = (prefix: string) => {
  return `prefix+${Math.random()}`;
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
