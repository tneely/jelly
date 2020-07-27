import { APIGatewayProxyHandler } from "aws-lambda";
// import { CognitoUserPool } from "amazon-cognito-identity-js";

// const userPool = new CognitoUserPool({
//   UserPoolId: process.env.USER_POOL_ID!,
//   ClientId: process.env.USER_POOL_CLIENT_ID!,
// });

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  // const route = event.pathParameters?.proxy;
  // switch (route) {
  //   case "signup":
  //     return signUp;
  //   case "signin":
  //     return signIn;
  //   default:
  //     throw new Error(`Unsupported authentication route: ${route}`);
  // }
  return {
    statusCode: 200,
    body: JSON.stringify(event, null, 2),
    isBase64Encoded: false,
  };
};

// const signUp = () => {
//   userPool.signUp();
// };

// const signIn = () => {};
