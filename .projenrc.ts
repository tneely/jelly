import { AwsCdkConstructLibrary } from "projen";

const project = new AwsCdkConstructLibrary({
  author: "Taylor Neely",
  authorAddress: "tneely417@gmail.com",
  cdkVersion: "1.127.0",
  defaultReleaseBranch: "release",
  name: "jelly",
  projenrcTs: true,
  repositoryUrl: "https://github.com/tneely/jelly.git",
  eslintOptions: { dirs: ["src"], prettier: true },

  deps: ["constructs", "monocdk"], // Use monocdk until CDKv2 is well supported
});

project.eslint!.addRules({
  "prettier/prettier": ["error", { printWidth: 120 }],
});

project.synth();
