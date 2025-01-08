import { tts } from "symmetric-parser";
import { runTs } from "../compiler";
import { getFilledGeneratorsFile, getTemplateFile, getTemplateGetterFile, readFromFile } from "../panel";
import {
  getAllFileTemplates,
  getAllRunnableWords,
  getAllWordPathsByLastModified,
  getWordNamesFromWordPaths,
  readFromConfig,
  readMultipleFromConfig,
  sortFilesByLastModified,
} from "./commandService";
import Runner from "../runner/runner";
import { Template } from "symmetric-parser/dist/src/templator/template-group";


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
  pathToStorage: string,
  runner: Runner
): Promise<DataFromConfigSO> {
  try {
    const filledGeneratorsPath = getFilledGeneratorsFile(pathToStorage);
    const generatorPath = '/Users/jaykoontz/Documents/GitHub/react-for-code/src/templator/utility-templates.ts'
    const templatePath  = getTemplateFile(pathToStorage);
    const promises = [
      readFromFile(generatorPath),
      readFromFile(templatePath),
      readFromFile(filledGeneratorsPath),
      getAllRunnableWords(pathToStorage),
      getAllWordPathsByLastModified(pathToStorage),
      runTs(getTemplateGetterFile(pathToStorage)),
      getAllFileTemplates(pathToStorage),
      // once upon a time, we initialized the UI
      // with word = last edited word.
      // it had downsides, like what if you just
      // edited generators?
      // but mostly it didn't fit with our new
      // Runner/dequeue paradigm.
      // getWordContents(sortedWordPaths[0]),
    ];

    //console.log("FROM STARTUP TEMPLATE MODEUL", templateModule);
    /* part of old Word-based regime, replaced with new Runner/dequeue paradigm
      const currentWordName = sortedWordPaths[0]
        .split("_")[1]
        .replace(".json", "");
        */

    const currentWord = [{ result: runner.currentTemplate }];
    const currentWordName =
      runner.currentStep.name + Date.now().toString().substring(7);
    return Promise.all(promises).then((data) => {
      const [
        generators,
        templates,
        filledGenerators,
        runnableWords,
        allWordPaths,
        templateModule,
        fileTemplates,
      ] = data;
      const wordNames = getWordNamesFromWordPaths(allWordPaths as string[]);

      return {
        generators: generators as string,
        templates: templates as string,
        filledGenerators: filledGenerators as string,
        currentWord: JSON.stringify(currentWord),
        currentWordName: currentWordName as string,
        wordNames: JSON.stringify(wordNames),
        templateModule: templateModule as string,
        fileTemplates: tts(fileTemplates as Template, false),
        runnableWords: JSON.stringify(runnableWords),
      };
    });
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}
