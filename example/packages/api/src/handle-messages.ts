import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { verifyCognitoJwt } from "./verification";

const dbName = process.env.DATABASE_NAME!;
const dbClient = new DynamoDB.DocumentClient();

export const handleMessages = async (event: APIGatewayProxyEvent) => {
  switch (event.httpMethod) {
    case "GET":
      return getMessage();
    case "POST":
      return putMessage(event);
    default:
      throw new Error(`Unsupported method: ${event.httpMethod}`);
  }
};

const getMessage = async () => {
  const items = await dbClient
    .query({
      TableName: dbName,
      KeyConditionExpression: "id = :key",
      ExpressionAttributeValues: {
        ":key": "message",
      },
      ScanIndexForward: false,
      Limit: 10,
    })
    .promise();
  return items.Items;
};

const putMessage = async (event: APIGatewayProxyEvent) => {
  const payload = event.body;

  if (!payload || payload.trim().length < 1) {
    throw new Error("Must specify a message");
  }

  await verifyCognitoJwt(event.headers.Authorization);

  const message = JSON.parse(payload).message;
  const now = new Date().getTime();
  await dbClient
    .put({
      TableName: dbName,
      Item: {
        id: "message",
        created: now,
        ttl: getTtl(now),
        message: message.substr(0, 250),
      },
    })
    .promise();
};

const getTtl = (currentTime: number) => {
  const days = 7;
  const millisInDay = 86400000;
  return currentTime + days * millisInDay;
};
