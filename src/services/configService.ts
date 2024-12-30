import { tts } from "symmetric-parser";
import { runTs } from "../compiler";
import { readFromFile } from "../panel";
import {
  getAllFileTemplates,
  getAllRunnableWords,
  getAllWordPathsByLastModified,
  getWordNamesFromWordPaths,
  readFromConfig,
  sortFilesByLastModified,
} from "./commandService";
import Runner from "../runner/runner";

type DataFromConfigSO = {
  generators: string;
  templates: string;
  filledGenerators: string;
  currentWord: string;
  currentWordName: string;
  wordNames: string;
  templateModule: string;
  fileTemplates: string;
  runnableWords: string;
};

// the coupling with Runner is unfortunate, but I don't care.
// we need it for the current template and name, and doing that
// outside this function is just a weird layer of indirection.
// though maybe we'll eat our words. til then
export async function fetchFromConfig(
  pathToConfig: string,
  runner: Runner
): Promise<DataFromConfigSO> {
  try {
    const generatorPath = await readFromConfig("GENERATOR_FILE", pathToConfig);

    const templatePath = await readFromConfig("TEMPLATE_FILE", pathToConfig);
    const runnableWords = await getAllRunnableWords(pathToConfig);
    const projectDir = await readFromConfig("PROJECT_DIR", pathToConfig);
    const filledGeneratorsPath = projectDir + "/filledGenerators.json";
    const allWordPaths = await getAllWordPathsByLastModified(pathToConfig);
    //const sortedWordPaths = await sortFilesByLastModified(allWordPaths);

    const templateModule = await runTs(projectDir + "/template-getter.ts");

    const promises = [
      readFromFile(generatorPath),
      readFromFile(templatePath),
      readFromFile(filledGeneratorsPath),
      // once upon a time, we initialized the UI
      // with word = last edited word.
      // it had downsides, like what if you just
      // edited generators?
      // but mostly it didn't fit with our new
      // Runner/dequeue paradigm.
      // getWordContents(sortedWordPaths[0]),
    ];
    const fileTemplates = await getAllFileTemplates(pathToConfig);
    //console.log("FROM STARTUP TEMPLATE MODEUL", templateModule);
    const wordNames = getWordNamesFromWordPaths(allWordPaths);
    /* part of old Word-based regime, replaced with new Runner/dequeue paradigm
      const currentWordName = sortedWordPaths[0]
        .split("_")[1]
        .replace(".json", "");
        */

    const currentWord = [{ result: runner.currentTemplate }];
    const currentWordName =
      runner.currentStep.name + Date.now().toString().substring(7);
    return Promise.all(promises).then((data) => {
      const [generators, templates, filledGenerators] = data;
      return {
        generators: generators as string,
        templates: templates as string,
        filledGenerators: filledGenerators as string,
        currentWord: JSON.stringify(currentWord),
        currentWordName,
        wordNames: JSON.stringify(wordNames),
        templateModule,
        fileTemplates: tts(fileTemplates, false),
        runnableWords: JSON.stringify(runnableWords),
      };
    });
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}
