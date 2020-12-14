import { Construct, Stack, StackProps } from "aws-cdk-lib";
import {
  GraphqlApi,
  ResolvableField,
  MappingTemplate,
  PrimaryKey,
  Values,
} from "aws-cdk-lib/lib/aws-appsync";
import { Table, AttributeType } from "aws-cdk-lib/lib/aws-dynamodb";
import { Comment } from "./object-types";

export interface ApiStackProps extends StackProps {
  api: GraphqlApi;
}

export class ApiStack extends Stack {
  constructor(scope: Construct, props: ApiStackProps) {
    super(scope, "ApiStack", props);

    const commentsTable = new Table(this, "CommentsTable", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "created",
        type: AttributeType.STRING,
      },
      timeToLiveAttribute: "ttl",
    });

    props.api.addType(Comment);
    const commentsDataSource = props.api.addDynamoDbDataSource("commentsDataSource", commentsTable);
    props.api.addQuery(
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
    commentValues.attribute("ttl").is("$util.time.nowEpochSeconds() + 3600 * 24 * 7");

    props.api.addMutation(
      "createComment",
      new ResolvableField({
        returnType: Comment.attribute(),
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
