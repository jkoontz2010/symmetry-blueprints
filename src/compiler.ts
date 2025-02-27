import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { readFromConfig } from "./services/commandService";
import { FoldMode, genTemplateWithVars, orderedFold, stringCleaning, tts } from "symmetric-parser";

const execAsync = promisify(exec);

const fullWord = genTemplateWithVars(
  {
    fullWord: () => `export function wordName(wordInput: Template): Template {wordBody\n}`,
  },
  ["wordName", "wordBody"]
);
// Run the compiled index.js file
export async function runIndexFile(outputDirectory) {
  const indexPath = path.join(outputDirectory, "src/index.ts");
  try {
    const { stdout, stderr } = await execAsync(`bun run ${indexPath}`);
    console.log("FROM STDOUT", stdout);
    if (stderr) console.error(stderr);
    return stdout;
  } catch (error) {
    console.error(`Execution error: ${error}`);
  }
}

// not sure if actually used?
export async function saveWord(wordContents: string, wordsFilePath: string) {
  const wordsContents = await fs.readFile(wordsFilePath, { encoding: "utf8" });
  const cleaned = stringCleaning(wordsContents)
  const t = {file: ()=> cleaned}
  const wordTempls = orderedFold(t, [fullWord],{mode:FoldMode.AllOrNothing}) 
  if(wordTempls == null) {
    console.error("Could not parse word file for some reason")
    return;
  }
  const {result, divisors} = wordTempls;
  console.log("result", tts(result,false), "divisors", tts(divisors,false))
  
}

export async function saveFile(filePath:string,fileContents:string) {
  return fs.writeFile(filePath, fileContents);
}

export async function deleteFile(filePath:string) {
  return fs.unlink(filePath);
}

export async function readFile(filePath:string) {
  return fs.readFile(filePath, { encoding: "utf8" });
}

export async function runTs(generatorFilePath: string) {
  try {
    const { stdout, stderr } = await execAsync(`bun run ${generatorFilePath}`);
    //console.log("generator FROM STDOUT", stdout);
    if (stderr) console.error(stderr);
    return stdout;
  } catch (error) {
    console.error(`Execution error: ${error}`);
  }
}