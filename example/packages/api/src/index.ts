import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const dbName = process.env.DATABASE_NAME!;
const dbClient = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  const items = await dbClient
    .query({
      TableName: dbName,
    })
    .promise();
  console.log(JSON.stringify(items));
  return {
    statusCode: 200,
    body: JSON.stringify(event, null, 2),
    isBase64Encoded: false,
  };
};
