import * as aws from "aws-sdk";

interface CodePipelineEvent {
  "CodePipeline.job": {
    id: string;
    accountId: string;
    data: {
      actionConfiguration: {
        configuration: {
          FunctionName: string;
          UserParameters: string;
        };
      };
      inputArtifacts: any[];
      outputArtifacts: any[];
      artifactCredentials: {
        accessKeyId: string;
        secretAccessKey: string;
        sessionToken: string;
        expirationTime: number;
      };
      encryptionKey: {
        id: string;
        type: string;
      };
    };
  };
}

interface DistributionInvalidateParameters {
  DISTRIBUTION_ID: string;
}

const codePipelineClient = new aws.CodePipeline();
const cloudFrontClient = new aws.CloudFront();

export const handler = async (event: CodePipelineEvent) => {
  console.log(
    `Processing distribution invalidation for request: ${JSON.stringify(event, undefined, 2)}`
  );

  const jobId = event["CodePipeline.job"].id;
  const distributionId = getParameters(event).DISTRIBUTION_ID;

  try {
    await invalidateDistribution(distributionId);
  } catch (err) {
    console.log(`Unable to invalidate distribution ${distributionId}`);
    await codePipelineClient
      .putJobFailureResult({
        jobId: jobId,
        failureDetails: {
          message: err.message,
          type: "JobFailed",
        },
      })
      .promise();
    throw err;
  }

  console.log(`Successfully invalidated ${distributionId}`);
  await codePipelineClient.putJobSuccessResult({ jobId }).promise();
};

const getParameters = (event: CodePipelineEvent): DistributionInvalidateParameters => {
  return JSON.parse(
    event["CodePipeline.job"].data.actionConfiguration.configuration.UserParameters
  );
};

const invalidateDistribution = async (distributionId: string) => {
  await cloudFrontClient
    .createInvalidation({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: new Date().toISOString(),
        Paths: {
          Quantity: 1,
          Items: ["/*"],
        },
      },
    })
    .promise();
};
