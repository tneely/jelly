import * as cdk from "@aws-cdk/core";
import * as appsync from "@aws-cdk/aws-appsync";
import * as db from "@aws-cdk/aws-dynamodb";
import { Comment } from "./object-types";

export interface ApiStackProps extends cdk.StackProps {
  api: appsync.GraphqlApi;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, props: ApiStackProps) {
    super(scope, "ApiStack", props);

    const commentsTable = new db.Table(this, "CommentsTable", {
      partitionKey: {
        name: "id",
        type: db.AttributeType.STRING,
      },
      sortKey: {
        name: "created",
        type: db.AttributeType.NUMBER,
      },
      timeToLiveAttribute: "ttl",
    });

    props.api.addType(Comment);
    const commentsDataSource = props.api.addDynamoDbDataSource("commentsDataSource", commentsTable);
    props.api.addQuery(
      "listComments",
      new appsync.ResolvableField({
        returnType: Comment.attribute({ isList: true }),
        dataSource: commentsDataSource,
        requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
        responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
      })
    );
    props.api.addMutation(
      "createComment",
      new appsync.ResolvableField({
        returnType: Comment.attribute(),
        dataSource: commentsDataSource,
        requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(
          appsync.PrimaryKey.partition("id").auto(),
          appsync.Values.projecting("text")
        ),
        responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
      })
    );
  }
}
