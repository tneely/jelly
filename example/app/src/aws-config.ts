export default {
  Auth: {
    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    // identityPoolId: "XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab",
    // REQUIRED - Amazon Cognito Region
    region: "us-east-1",
    // OPTIONAL - Amazon Cognito Federated Identity Pool Region
    // Required only if it's different from Amazon Cognito Region
    // identityPoolRegion: "XX-XXXX-X",
    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: "us-east-1_042y1q53G",
    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: "29oue3og38a58oovni31141rm",
    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    // mandatorySignIn: false,
    // OPTIONAL - Configuration for cookie storage
    // Note: if the secure flag is set to true, then the cookie transmission requires a secure protocol
    // cookieStorage: {
    // REQUIRED - Cookie domain (only required if cookieStorage is provided)
    //   domain: ".yourdomain.com",
    // OPTIONAL - Cookie path
    //   path: "/",
    // OPTIONAL - Cookie expiration in days
    //   expires: 365,
    // OPTIONAL - Cookie secure flag
    // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
    //   secure: true,
    // },
    // OPTIONAL - customized storage object
    // storage: new MyStorage(),
    // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
    // authenticationFlowType: "USER_PASSWORD_AUTH",
    // OPTIONAL - Manually set key value pairs that can be passed to Cognito Lambda Triggers
    // clientMetadata: { myCustomKey: "myCustomValue" },
    // OPTIONAL - Hosted UI configuration
    oauth: {
      domain: "auth.cdk-jelly.com",
      scope: ["phone", "email", "profile", "openid", "aws.cognito.signin.user.admin"],
      redirectSignIn: "https://www.cdk-jelly.com/",
      redirectSignOut: "https://www.cdk-jelly.com/",
      responseType: "code", // or 'token', note that REFRESH token will only be generated when the responseType is code
    },
  },
  aws_appsync_graphqlEndpoint:
    "https://i7y3sibv5fauzaq7vqph77wj4q.appsync-api.us-east-1.amazonaws.com/graphql",
  aws_appsync_region: "us-east-1",
  aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS",
};
