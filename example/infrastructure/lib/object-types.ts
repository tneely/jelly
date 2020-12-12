import { ObjectType } from "aws-cdk-lib/lib/aws-appsync";
import * as scalar from "./scalar-types";

export const Comment = new ObjectType("Comment", {
  definition: {
    text: scalar.string,
  },
});
