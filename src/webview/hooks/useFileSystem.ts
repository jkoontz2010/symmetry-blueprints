import React from "react";

export function useFileSystem(postMessage, configPath) {
  const [generatorsFileText, setGeneratorsFileText] = React.useState<string>(null);
  const [templatesFileText, setTemplatesFileText] = React.useState<string>(null);
  const [wordsFileText, setWordsFileText] = React.useState<string>(null);

  React.useEffect(() => {
    window.addEventListener("message", (event) => {
      const message = event.data; // The json data that the extension sent
      switch (message.command) {
        case "config_data":
          console.log("MESSAGE DATA", message.data);
            const { generators, templates, words }: {generators:string, words:string,templates:string} = message.data;
            setGeneratorsFileText(generators);
            setTemplatesFileText(templates);
            setWordsFileText(words);
          break;
      }
    });
  });
  const readAllFiles = async () => {
    postMessage({ command: "fetch_from_config", pathToConfig: configPath });
  };
  const writeFile = async (path, data) => {
    postMessage({ command: "writeFile", path, data });
  };
  return { readAllFiles, writeFile,
    generatorsFileText,
    templatesFileText,
    wordsFileText
   };
}
