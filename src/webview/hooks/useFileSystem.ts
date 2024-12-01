import { set } from "lodash";
import React from "react";
import { WordStep } from "./useTemplate";

export function useFileSystem(postMessage, configPath) {
  const [generatorsFileText, setGeneratorsFileText] =
    React.useState<string>(null);
  const [templatesFileText, setTemplatesFileText] =
    React.useState<string>(null);
  const [wordsFileText, setWordsFileText] = React.useState<string>(null);
  const [filledGeneratorsFileText, setFilledGeneratorsFileText] =
    React.useState<string>(null);
  const [currentWord, setCurrentWord] = React.useState<WordStep[]>(null);
  const [wordNames, setWordNames] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [currentWordName, setCurrentWordName] = React.useState<string>(null);
  const [templateModule, setTemplateModule] = React.useState<any>(null);
  React.useEffect(()=> {
    postMessage({ command: "set_config_path", pathToConfig: configPath });
  },[configPath])
  React.useEffect(() => {
    window.addEventListener("message", (event) => {
      const message = event.data; // The json data that the extension sent
      switch (message.command) {
        case "config_data": {
          console.log("MESSAGE DATA", message.data);
          const {
            generators,
            templates,
            words,
            filledGenerators,
            currentWord,
            wordNames,
            currentWordName,
            templateModule
          }: {
            generators: string;
            words: string;
            templates: string;
            filledGenerators: string;
            currentWord: string;
            wordNames: string;
            currentWordName: string;
            templateModule:string;
          } = message.data;
          setGeneratorsFileText(generators);
          setTemplatesFileText(templates);
          setWordsFileText(words);
          setFilledGeneratorsFileText(filledGenerators);
          const parsedCurrentWord = JSON.parse(currentWord).map((cw) => ({
            ...cw,
            result: new Function("return " + cw.result)(),
          }));

          setCurrentWord(parsedCurrentWord);
          setWordNames(JSON.parse(wordNames));
          setCurrentWordName(currentWordName);
          console.log("FROM FILE", templateModule);
          const templModuleFirstParse = new Function("return " + templateModule)();
          const templModule = Object.keys(templModuleFirstParse).reduce((acc, key) => {
            acc[key] = new Function("return " + templModuleFirstParse[key])();
            return acc;
          }, {});
          console.log("templModuletemplModuletemplModuleHOW DOES THIS LOOK", templModule); 
          setTemplateModule(templModule);
          setLoading(false);
          break;
        }
        case "word_contents": {
          const { wordName, wordContents } = message.data;
          console.log("WORD CONTENTS", message);
          setCurrentWordName(wordName);
          let parsedCurrentWord
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
        };
        case "all_templates": {
          const { templatesModule } = message.data;

         // setTemplatesFileText(templates);
          break;
        }
      }
    });
  }, []);
  const readAllFiles = () => {
    postMessage({ command: "fetch_from_config", pathToConfig: configPath });
  };
  const writeFile = (path, data) => {
    postMessage({ command: "writeFile", path, data });
  };
  const setWord = (name) => {
    postMessage({
      command: "get_word",
      wordName: name,
      pathToConfig: configPath,
    });

    setLoading(true);
  };
  const createNewWord = (name) => {
    // word_contents received in response
    postMessage({
      command: "create_word",
      wordName: name,
      pathToConfig: configPath,
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
      pathToConfig: configPath,
    });
  };
  return {
    readAllFiles,
    createNewWord,
    writeFile,
    setWord,
    addToTemplatePool,
    generatorsFileText,
    templatesFileText,
    wordsFileText,
    filledGeneratorsFileText,
    currentWord,
    currentWordName,
    wordNames,
    loading,
    templateModule
  };
}
