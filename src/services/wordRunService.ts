import { readFromConfig } from "./commandService";
import { deleteFile, runTs, saveFile } from "../compiler";
import { formWordRunFile, QUEUE_SPLITTER, RESULT_SPLITTER } from "./hardToParse/util";
import { RunnerConfig } from "../runner/runner";

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
export function parseWordRunResult(result: string): WordRunParse {
  const split = result.split(RESULT_SPLITTER);
  const template = split[0];
  const queue = split[1];
  if(queue!=null) {
    const queueTemplates = queue.split(QUEUE_SPLITTER).filter(q=>q.length>0).map(q=>q.trim());

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
  poolDir: string,
  wordName: string,
  templateAsString: TemplateAsString,
  keepResultFile: boolean,
  keepWordRunFile: boolean
): Promise<WordRunResult> {
  const filePrefix = Date.now();
  const wordRunFile = formWordRunFile(wordName, templateAsString);
  const wordRunFileName = filePrefix + "_wordRun.ts";
  const resultFile = filePrefix + "_result";

  const wordRunFilePath = poolDir + "/" + wordRunFileName;
  const resultFilePath = poolDir + "/" + resultFile;
  // saveFile doesn't belong here
  await saveFile(wordRunFilePath, wordRunFile);
  const result = await runTs(wordRunFilePath);
  //console.log("ran word")
  const { template, queue } = parseWordRunResult(result);
  if(!keepResultFile) {
    deleteFile(resultFilePath);
  }
  if(!keepWordRunFile) {
    deleteFile(wordRunFilePath);
  }
  //console.log("word run RESULTv,", template);
  // UNCOMMENT IF WE WANT THE RESULT FILE STILL
  // await saveFile(resultFilePath, template+"\n"+queue.join("\n"));
  return {
    template,
    queuedTemplates: queue,
    wordRunFilePath: keepWordRunFile ? wordRunFilePath : "deleted",
    resultFilePath: keepResultFile ? resultFilePath : "deleted",
  };
}
