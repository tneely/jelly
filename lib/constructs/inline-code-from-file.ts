import * as lambda from "@aws-cdk/aws-lambda";
import * as path from "path";
import * as fs from "fs";
import * as child_process from "child_process";
import * as crypto from "crypto";

export class InlineCodeFromFile extends lambda.InlineCode {
  constructor(entry: string) {
    validateEntry(entry);
    const buildDir = path.join(path.dirname(entry), ".build");
    const outDir = path.join(
      buildDir,
      crypto.createHash("sha256").update(entry).digest("hex")
    );
    const codePath = compileCodeFromFile(entry, outDir);
    const code = fs.readFileSync(codePath).toString();

    super(code);
  }
}

const validateEntry = (entry: string) => {
  if (!/\.(js|ts)$/.test(entry)) {
    throw new Error("Only JavaScript or TypeScript entry files are supported.");
  }
  if (!fs.existsSync(entry)) {
    throw new Error(`Cannot find entry file at ${entry}`);
  }
  return entry;
};

const compileCodeFromFile = (entry: string, outDir: string) => {
  const tscPath = loadTscPath();
  try {
    const args = [
      entry,
      "--outDir",
      outDir,
      "--module",
      "CommonJS",
      "--target",
      "ES2019",
    ];
    const tsc = child_process.spawnSync(tscPath, args);
    if (tsc.error) {
      throw tsc.error;
    }
    if (tsc.status !== 0) {
      throw new Error(tsc.stdout.toString().trim());
    }
  } catch (err) {
    throw new Error(`Failed to build file at ${entry}: ${err}`);
  }

  return path.join(outDir, path.basename(entry).replace(".ts", ".js"));
};

const loadTscPath = () => {
  let typescriptPath;
  try {
    // This will throw if `typescript` cannot be found
    typescriptPath = require.resolve("typescript/package.json");
  } catch (err) {
    throw new Error(
      "It looks like Typescript is not installed. How are you running this?"
    );
  }
  const typescriptDir = path.dirname(typescriptPath);
  const typescriptPkg = JSON.parse(fs.readFileSync(typescriptPath, "utf8"));

  return path.join(typescriptDir, typescriptPkg.bin.tsc);
};
