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
          }: {
            generators: string;
            words: string;
            templates: string;
            filledGenerators: string;
            currentWord: string;
            wordNames: string;
            currentWordName: string;
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
          console.log("FROM FILE", filledGenerators);
          setLoading(false);
          break;
        }
        case "word_contents": {
          const { wordName, wordContents } = message.data;
          console.log("WORD CONTENTS", message);
          setCurrentWordName(wordName);
          const parsedCurrentWord = JSON.parse(wordContents).map((cw) => ({
            ...cw,
            result: new Function("return " + cw.result)(),
          }));
          setCurrentWord(parsedCurrentWord);
          setLoading(false)
          break;
        }
      }
    });
  },[]);
  const readAllFiles = async () => {
    postMessage({ command: "fetch_from_config", pathToConfig: configPath });
  };
  const writeFile = async (path, data) => {
    postMessage({ command: "writeFile", path, data });
  };
  const setWord = async (name) => {
    postMessage({
      command: "get_word",
      wordName: name,
      pathToConfig: configPath,
    });
    setLoading(true)
  };
  return {
    readAllFiles,
    writeFile,
    setWord,
    generatorsFileText,
    templatesFileText,
    wordsFileText,
    filledGeneratorsFileText,
    currentWord,
    currentWordName,
    wordNames,
    loading,
  };
}
