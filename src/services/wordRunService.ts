import { readFromConfig } from "./commandService";
import { runTs, saveFile } from "../compiler";

export function formWordRunFile(wordName: string, template: string): string {
  return `import { ${wordName} } from "./word-pool";\nimport { tts } from "symmetric-parser";\nconst template = ${template};\nconst result = ${wordName}(template);\nconsole.log(tts(result, false));`;
}

export type TemplateAsString = string;

export type WordRunResult = {
  template: string;
  wordRunFilePath: string;
  resultFilePath: string;
};
// !!: the template is passed in as a string
// and the return is also a string
// this is bc it's from the command line.
export async function runWord(
  pathToConfig: string,
  wordName: string,
  templateAsString: TemplateAsString
): Promise<WordRunResult> {
  const projectDir = await readFromConfig("PROJECT_DIR", pathToConfig);
  const filePrefix = Date.now();
  const wordRunFile = formWordRunFile(wordName, templateAsString);
  const wordRunFileName = filePrefix + "_wordRun.ts";
  const resultFile = filePrefix + "_result";
  const wordRunFilePath = projectDir + "/" + wordRunFileName;
  const resultFilePath = projectDir + "/" + resultFile;
  // saveFile doesn't belong here
  await saveFile(wordRunFilePath, wordRunFile);
  const result = await runTs(wordRunFilePath);
  console.log("word run RESULTv,", result);
  await saveFile(resultFilePath, result);
  return {
    template: result,
    wordRunFilePath,
    resultFilePath,
  };
}
