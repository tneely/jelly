import * as jwt from "jsonwebtoken";

interface TokenHeader {
  kid: string;
  alg: string;
}

interface Payload {
  token_use: string;
  auth_time: number;
  iss: string;
  exp: number;
  username: string;
  client_id: string;
}

export const verifyCognitoJwt = (token?: string) => {
  if (!token || token.length < 1) {
    throw new Error("No token present");
  }

  verifySections(token);
  const payload = jwt.decode(token) as Payload;
  console.log(payload);
  verifyExpiration(payload);
};

const verifySections = (token: string) => {
  const tokenSections = token.split(".");
  if (tokenSections.length < 2) {
    throw new Error("Token is invalid");
  }
};

const verifyExpiration = (payload: Payload) => {
  const now = Date.now() / 1000;
  if (payload.exp < now) {
    throw new Error("Token is expired");
  }
};
