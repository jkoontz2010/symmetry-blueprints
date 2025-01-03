import { readFromConfig } from "./commandService";
import { runTs, saveFile } from "../compiler";

export function formWordRunFile(wordName: string, template: string): string {
  return `import { getQueue, clearQueue, ${wordName} } from "./word-pool";\nimport { tts } from "symmetric-parser";
  function run(func: () => string, keyName: string) {
  try {
    if (func == null) {
      return "\${run(" + keyName + ", '" + keyName + "')}";
    }
    if (typeof func === "string") {
      throw new Error("func is string");
    }
    const result = func();
    return result;
  } catch (e) {
    return "\${run(" + keyName + ", '" + keyName + "')}";
  }
}
  \nconst template = ${template};\nconst result = ${wordName}(template);\nconst queue=getQueue();\nconsole.log(tts(result, false));\nif(queue.length>0) {\nconsole.log("|||||||");\nqueue.forEach(q=>console.log(tts(q,false),"&&&&&&&"))}\nclearQueue();`;
}

export type TemplateAsString = string;

export type WordRunResult = {
  template: string;
  wordRunFilePath: string;
  resultFilePath: string;
  queuedTemplates: string[];
};

type WordRunParse = {
  template: string;
  queue: string[];
}
function parseWordRunResult(result: string): WordRunParse {
  const split = result.split("|||||||");
  const template = split[0];
  const queue = split[1];
  if(queue!=null) {
    const queueTemplates = queue.split("&&&&&&&").filter(q=>q.length>0).map(q=>q.trim());

    return {
      template,
      queue: queueTemplates
    }
  
  } else {
    return {template, queue: []}
  }

}
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
  console.log("ran word")
  const { template, queue } = parseWordRunResult(result);
  console.log("word run RESULTv,", template);
  await saveFile(resultFilePath, template+"\n"+queue.join("\n"));
  return {
    template,
    queuedTemplates: queue,
    wordRunFilePath,
    resultFilePath,
  };
}
