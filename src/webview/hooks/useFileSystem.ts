import React from "react";
import { WordStep } from "./useTemplate";
import { tts } from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

function parseStringifiedTemplateModule(templateModule: string) {
  const templModuleFirstParse = new Function("return " + templateModule)();
  const templModule = Object.keys(templModuleFirstParse).reduce((acc, key) => {
    const templified = new Function("return " + templModuleFirstParse[key])();
    acc[key] = templified;
    return acc;
  }, {});
  return templModule;
}

export function useFileSystem(postMessage) {
  const [all, setAll] = React.useState<any>({
    generatorsFileText: null,
    templatesFileText: null,
    filledGeneratorsFileText: null,
    currentWord: null,
    wordNames: [],
    currentWordName: null,
    templateModule: null,
    allFileTemplates: null,
    runnableWords: null,
    queueNames: [],
    subTemplate: null
  });
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    window.addEventListener("message", (event) => {
      const message = event.data; // The json data that the extension sent
      switch (message.command) {
        case "config_data": {
          const {
            generators,
            templates,
            filledGenerators,
            currentWord,
            wordNames,
            currentWordName,
            templateModule,
            fileTemplates,
            runnableWords,
            queueNames,
            subTemplate,
          }: {
            generators: string;
            templates: string;
            filledGenerators: string;
            currentWord: string;
            wordNames: string;
            currentWordName: string;
            templateModule: string;
            fileTemplates: string;
            runnableWords: string;
            queueNames: string;
            subTemplate: string;
          } = message.data;
          const rw = JSON.parse(runnableWords);
          const parsedCurrentWord = JSON.parse(currentWord).map((cw) => ({
            ...cw,
            result: new Function("return " + cw.result)(),
          }));
          const parsedAllFileTemplate = new Function(
            "return " + fileTemplates
          )();
          const parsedSubTemplate =
            subTemplate == null
              ? null
              : new Function("return " + subTemplate)();
          const templModule = parseStringifiedTemplateModule(templateModule);
          const parsedWordNames = JSON.parse(wordNames);
          const parsedQueueNames = JSON.parse(queueNames);

          const all ={
            generatorsFileText: generators,
            templatesFileText: templates,
            filledGeneratorsFileText: filledGenerators,
            currentWord: parsedCurrentWord,
            wordNames: parsedWordNames,
            currentWordName: currentWordName,
            templateModule: templModule,
            allFileTemplates: parsedAllFileTemplate,
            runnableWords: rw,
            queueNames: parsedQueueNames,
            subTemplate: parsedSubTemplate,
          };
          setAll(all);
          setLoading(false);
          break;
        }
        case "word_contents": {
          const { wordName, wordContents } = message.data;
          console.log("WORD CONTENTS", message);
          //setCurrentWordName(wordName);
          let parsedCurrentWord;
          if (wordContents === "[]") {
            parsedCurrentWord = [{ result: {} }];
          } else {
            parsedCurrentWord = JSON.parse(wordContents).map((cw) => ({
              ...cw,
              result: new Function("return " + cw.result)(),
            }));
          }
          //setCurrentWord(parsedCurrentWord);
          let newWordNames = all.wordNames;
          if (!all.wordNames.includes(wordName)) {
            newWordNames=[...all.wordNames, wordName];
          }
          setAll((prev) => ({ ...prev, wordNames: newWordNames, currentWord:parsedCurrentWord, currentWordName:wordName }));
          setLoading(false);
          break;
        }
        case "all_templates": {
          const { templateModule } = message.data;
          const templModule = parseStringifiedTemplateModule(templateModule);
          setAll((prev) => ({ ...prev, templateModule: templModule }));
          break;
        }
        case "all_file_templates": {
          const { fileTemplates } = message.data;

          setAll((prev) => ({ ...prev, allFileTemplates: new Function("return " + fileTemplates)() }));
          break;
        }
        case "all_runnable_words": {
          const { runnableWords } = message.data;
          const rw = JSON.parse(runnableWords);
          setAll((prev) => ({ ...prev, runnableWords: rw }));
        }
      }
    });
  }, []);
  const readAllFiles = () => {
    postMessage({ command: "fetch_from_config" });
  };
  const writeFile = (path, data) => {
    postMessage({ command: "writeFile", path, data });
  };
  const setWord = (name) => {
    postMessage({
      command: "get_word",
      wordName: name,
    });

    setLoading(true);
  };
  const createNewWord = (name) => {
    // word_contents received in response
    postMessage({
      command: "create_word",
      wordName: name,
    });
    setLoading(true);
  };
  const addToTemplatePool = (key: string, value: string, args: string[]) => {
    console.log("SENDING TO ADD TO TEMPLATE POOL", key, value, args);
    postMessage({
      command: "add_template",
      key,
      args: JSON.stringify(args),
      value,
    });
  };
  const selectQueue = (queueName) => {
    postMessage({
      command: "select_queue",
      queueName,
    });
  };

  return {
    readAllFiles,
    createNewWord,
    writeFile,
    setWord,
    addToTemplatePool,
    selectQueue,
    loading,
    ...all,
  };
}
