import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const dbName = process.env.DATABASE_NAME!;
const dbClient = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  const route = event.pathParameters?.proxy;
  switch (route) {
    case "messages":
      const payload = await handleMessages(event.httpMethod);
      console.log("payload: ", JSON.stringify(payload));
      break;
    default:
      throw new Error(`Unsupported path: ${route}`);
  }
  return {
    statusCode: 200,
    body: JSON.stringify(event, null, 2),
    isBase64Encoded: false,
  };
};

const handleMessages = async (method: string) => {
  switch (method) {
    case "GET":
      return getMessage();
    case "PUT":
      return putMessage("test");
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
};

const getMessage = async () => {
  const items = await dbClient
    .query({
      TableName: dbName,
    })
    .promise();
  return items.$response.data;
};

const putMessage = async (message: string) => {
  const data = await dbClient
    .put({
      TableName: dbName,
      Item: {
        message,
      },
    })
    .promise();
  return data.$response.data;
};
