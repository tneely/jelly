# Example Jelly Infrastructure

This package serves as a simple infrastructure for the example Jelly application.
It leverages the [CDK Pipelines][1] construct to be fully CI/CD.

[1]: https://docs.aws.amazon.com/cdk/api/latest/docs/pipelines-readme.html

## Bootstrapping

The pipeline sources from a GitHub repository.
In order for the pipeline to access and read from the repository, you'll need to create a [personal access token][2] in GitHub.
You will need to grant it the `repo` scope. Save the token value.

In AWS, create a new Secret in [AWS Secrets Manager][3] with the name `github/token/example-jelly-app`.
The Secret value should be the token value generated in GitHub earlier.

Follow the pipeline instructions for [bootstrapping][4] and [initial deployment][5].

[2]: https://github.com/settings/tokens
[3]: https://aws.amazon.com/secrets-manager/
[4]: https://docs.aws.amazon.com/cdk/api/latest/docs/pipelines-readme.html#cdk-environment-bootstrapping
[5]: https://docs.aws.amazon.com/cdk/api/latest/docs/pipelines-readme.html#initial-pipeline-deployment
