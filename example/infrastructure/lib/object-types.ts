import * as scalar from "./scalar-types";
import * as appsync from "@aws-cdk/aws-appsync";

export const Comment = new appsync.ObjectType("Comment", {
  definition: {
    text: scalar.string,
  },
});
