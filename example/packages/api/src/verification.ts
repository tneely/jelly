import * as jwt from "jsonwebtoken";

interface TokenHeader {
  kid: string;
  alg: string;
}

export const verifyCognitoJwt = (token?: string) => {
  if (!token || token.length < 1) {
    throw new Error("No token present");
  }

  verifySections(token);
  const content = jwt.decode(token);
  console.log(content);
};

const verifySections = (token: string) => {
  const tokenSections = token.split(".");
  if (tokenSections.length < 2) {
    throw new Error("Token is invalid");
  }
};
