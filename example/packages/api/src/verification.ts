import * as jwt from "jsonwebtoken";
import * as Axios from "axios";
import jwkToPem from "jwk-to-pem";

interface TokenHeader {
  kid: string;
  alg: string;
}

interface Payload {
  token_use: string;
  auth_time: number;
  aud: string;
  iss: string;
  exp: number;
  username: string;
  client_id: string;
}

interface PublicKey {
  alg: string;
  e: string;
  kid: string;
  kty: "RSA";
  n: string;
  use: string;
}

interface PublicKeys {
  keys: PublicKey[];
}

interface PublicKeyMeta {
  instance: PublicKey;
  pem: string;
}

interface MapOfKidToPublicKey {
  [key: string]: PublicKeyMeta;
}

const cognitoClientId = `${process.env.USER_CLIENT_ID}`;
const cognitoIssuerUrl = `${process.env.USER_POOL_URL}/.well-known/jwks.json`;

export const verifyCognitoJwt = async (token?: string) => {
  if (!token || token.length < 1) {
    throw new Error("No token present");
  }

  const payload = await verifyHeaderAndGetPayload(token);
  verifyExpiration(payload);
  verifyAudience(payload);
};

const verifyAndGetSections = (token: string) => {
  const tokenSections = token.split(".");
  if (tokenSections.length < 2) {
    throw new Error("Token is invalid");
  }
  return tokenSections;
};

const verifyHeaderAndGetPayload = async (token: string) => {
  const tokenSections = verifyAndGetSections(token);
  const headerJSON = Buffer.from(tokenSections[0], "base64").toString("utf8");
  const header = JSON.parse(headerJSON) as TokenHeader;
  const keys = await getPublicKeys();
  const key = keys[header.kid];
  if (key === undefined) {
    throw new Error("Token uses unknown kid");
  }

  return jwt.verify(token, key.pem) as Payload;
};

let cacheKeys: MapOfKidToPublicKey | undefined;
const getPublicKeys = async (): Promise<MapOfKidToPublicKey> => {
  if (!cacheKeys) {
    const publicKeys = await Axios.default.get<PublicKeys>(cognitoIssuerUrl);
    cacheKeys = publicKeys.data.keys.reduce((agg, current) => {
      const pem = jwkToPem(current);
      agg[current.kid] = { instance: current, pem };
      return agg;
    }, {} as MapOfKidToPublicKey);
    return cacheKeys;
  } else {
    return cacheKeys;
  }
};

const verifyExpiration = (payload: Payload) => {
  const now = Math.floor(Date.now() / 1000);
  if (now < payload.auth_time || now > payload.exp) {
    throw new Error("Token is expired");
  }
};

const verifyAudience = (payload: Payload) => {
  if (payload.aud != cognitoClientId) {
    throw new Error("Token audience mismatch");
  }
};
