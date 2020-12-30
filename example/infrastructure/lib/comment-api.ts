import { StackProps } from "aws-cdk-lib";
import { ResolvableField, MappingTemplate, PrimaryKey, Values } from "aws-cdk-lib/lib/aws-appsync";
import { Table, AttributeType } from "aws-cdk-lib/lib/aws-dynamodb";
import { Api } from "cdk-jelly/dist/constructs";
import { Comment } from "./object-types";
import { string } from "./scalar-types";

export class CommentApi {
  constructor(api: Api) {
    const commentsTable = api.addTable("Comments", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "created",
        type: AttributeType.STRING,
      },
    });

    api.addType(Comment);
    const commentsDataSource = api.addDynamoDbDataSource("commentsDataSource", commentsTable);
    api.addQuery(
      "listComments",
      new ResolvableField({
        returnType: Comment.attribute({ isList: true }),
        dataSource: commentsDataSource,
        requestMappingTemplate: MappingTemplate.dynamoDbScanTable(),
        responseMappingTemplate: MappingTemplate.dynamoDbResultList(),
      })
    );

    const commentValues = Values.projecting();
    commentValues.attribute("created").is("$util.time.nowISO8601()");
    // TODO: Add TTL once math is supported using #set
    // #set ($ttl = $util.time.nowEpochSeconds() + 3600 * 24 * 7)
    // commentValues.attribute("ttl").is("$ttl");

    api.addMutation(
      "createComment",
      new ResolvableField({
        returnType: Comment.attribute(),
        args: { text: string },
        dataSource: commentsDataSource,
        requestMappingTemplate: MappingTemplate.dynamoDbPutItem(
          PrimaryKey.partition("id").auto(),
          commentValues
        ),
        responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
      })
    );
  }
}
