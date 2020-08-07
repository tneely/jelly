import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDB, Lambda } from "aws-sdk";

const dbName = process.env.DATABASE_NAME!;
const authLambdaName = process.env.AUTH_LAMBDA_ARN!;

const dbClient = new DynamoDB.DocumentClient();
const lambdaClient = new Lambda();

interface VerificationResponse {
  authenticated: boolean;
  message?: string;
}

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

const verifyCognitoJwt = async (token: string) => {
  const response = await lambdaClient
    .invoke({
      FunctionName: authLambdaName,
      Qualifier: "Prod",
      Payload: { token },
    })
    .promise();

  console.log(response);

  const payload: VerificationResponse = JSON.parse(response.Payload as string);
  if (!payload.authenticated) {
    throw new Error(`Could not authenticate user: ${payload.message}`);
  }
};

const getTtl = (currentTime: number) => {
  const days = 7;
  const millisInDay = 86400000;
  return currentTime + days * millisInDay;
};
