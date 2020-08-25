# Example Jelly API

This package serves as a simple rest API for the example Jelly application.
It is written in Typescript and bundled by Parcel to easily be deployed to Lambda.

## Available Scripts

In the project directory, you can run:

### `npm run build`

Builds the code in `src` for production to the `dist` folder.
This code is minified and bundled using Parcel.
The `aws-sdk` package is excluded from build, as it is natively available in the Lambda runtime.
