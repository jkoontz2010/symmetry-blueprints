
import React from "react";
import { WordStep } from "./useTemplate";
import { tts } from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

function parseStringifiedTemplateModule(templateModule: string) {
  const templModuleFirstParse = new Function("return " + templateModule)();
  const templModule = Object.keys(templModuleFirstParse).reduce((acc, key) => {
    const templified = new Function("return " + templModuleFirstParse[key])();
    console.log(key, "TEMPLIFIED", templified);
    acc[key] = templified;
    return acc;
  }, {});
  return templModule
}

export function useFileSystem(postMessage) {
  const [generatorsFileText, setGeneratorsFileText] =
    React.useState<string>(null);
  const [templatesFileText, setTemplatesFileText] =
    React.useState<string>(null);
  const [filledGeneratorsFileText, setFilledGeneratorsFileText] =
    React.useState<string>(null);
  const [currentWord, setCurrentWord] = React.useState<WordStep[]>(null);
  const [wordNames, setWordNames] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [currentWordName, setCurrentWordName] = React.useState<string>(null);
  const [templateModule, setTemplateModule] = React.useState<any>(null);
  const [allFileTemplates, setAllFileTemplates] = React.useState<any>(null);
  const [runnableWords, setRunnableWords] = React.useState<string[]>(null);
  const [queueNames, setQueueNames] = React.useState<string[]>([]);

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
            queueNames
          }: {
            generators: string;
            templates: string;
            filledGenerators: string;
            currentWord: string;
            wordNames: string;
            currentWordName: string;
            templateModule: string;
            fileTemplates:string;
            runnableWords:string;
            queueNames:string;
          } = message.data;
          setGeneratorsFileText(generators);
          setTemplatesFileText(templates);
          const rw = JSON.parse(runnableWords);
          setRunnableWords(rw);
          setFilledGeneratorsFileText(filledGenerators);
          const parsedCurrentWord = JSON.parse(currentWord).map((cw) => ({
            ...cw,
            result: new Function("return " + cw.result)(),
          }));

          setCurrentWord(parsedCurrentWord);
          setWordNames(JSON.parse(wordNames));
          setQueueNames(JSON.parse(queueNames));
          setCurrentWordName(currentWordName);
          setAllFileTemplates(new Function("return " + fileTemplates)());

          const templModule = parseStringifiedTemplateModule(templateModule);
          setTemplateModule(templModule);
          setLoading(false);
          break;
        }
        case "word_contents": {
          const { wordName, wordContents } = message.data;
          console.log("WORD CONTENTS", message);
          setCurrentWordName(wordName);
          let parsedCurrentWord;
          if (wordContents === "[]") {
            parsedCurrentWord = [{ result: {} }];
          } else {
            parsedCurrentWord = JSON.parse(wordContents).map((cw) => ({
              ...cw,
              result: new Function("return " + cw.result)(),
            }));
          }
          setCurrentWord(parsedCurrentWord);
          if (!wordNames.includes(wordName)) {
            setWordNames([...wordNames, wordName]);
          }

          setLoading(false);
          break;
        }
        case "all_templates": {
          const { templateModule } = message.data;
          const templModule = parseStringifiedTemplateModule(templateModule);

          setTemplateModule(templModule);
          break;
        }
        case "all_file_templates": {
          const { fileTemplates } = message.data;
          setAllFileTemplates(new Function("return " + fileTemplates)());
          break;
        }
        case "all_runnable_words": {
          const { runnableWords } = message.data;
          const rw = JSON.parse(runnableWords);
          setRunnableWords(rw);
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
      queueName
    });
  }

  return {
    readAllFiles,
    createNewWord,
    writeFile,
    setWord,
    addToTemplatePool,
    generatorsFileText,
    templatesFileText,
    runnableWords,
    filledGeneratorsFileText,
    currentWord,
    currentWordName,
    wordNames,
    loading,
    templateModule,
    allFileTemplates,
    queueNames,
    selectQueue
  };
}
