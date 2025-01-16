import * as React from "react";
import { CssVarsProvider } from "@mui/joy";
import { useFileSystem } from "../hooks/useFileSystem";
import { TemplateEditors } from "./TemplateTree";
import { buildAllGeneratorsTemplate, buildGeneratorNamesFromMeta } from "../util/parsers/parseGenerators";
import Dropdown from "./Dropdown";
import { WordCreator } from "./WordCreator";
import { GTWVEditor } from "./GTWVEditor";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import { QueueHeader } from "./QueueHeader";

export function run(func: () => string, keyName: string) {
  try {
    if (func == null) {
      return "${run(" + keyName + ", '" + keyName + "')}";
    }
    if (typeof func === "string") {
      throw new Error("func is string");
    }
    const result = func();
    return result;
  } catch (e) {
    return "${run(" + keyName + ", '" + keyName + "')}";
  }
}
interface vscode {
  postMessage(message: any): void;
}
declare const vscode: vscode;


export const CONFIG_PATH =
  "/Users/jaykoontz/Documents/GitHub/symmetric-blueprints/.spconfig";
const App = () => {
  const {
    readAllFiles,
    generatorsFileText,
    templatesFileText,
    loading,
    filledGeneratorsFileText,
    wordNames,
    currentWord,
    currentWordName,
    setWord,
    createNewWord,
    addToTemplatePool,
    templateModule,
    allFileTemplates,
    runnableWords,
    selectQueue,
    queueNames,
    subTemplate,
  } = useFileSystem(vscode.postMessage);
  React.useEffect(() => {
    readAllFiles("TemplateTreeParse");
  }, []);
  const [showGTWVEditor, setShowGTWVEditor] = React.useState(false);
  const generatorMeta = !loading ? buildAllGeneratorsTemplate(generatorsFileText) : {}
  const generatorNames = !loading ? buildGeneratorNamesFromMeta(generatorMeta) : []
  return (
    <div style={{backgroundColor: "#f6f8fa", width:"100%"}}>
      <div><QueueHeader/></div>
      <CssVarsProvider>
        <Dropdown
          options={queueNames}
          onSelect={(value) => {
            selectQueue(value);
          }}
          placeholder="Select a queue"
          id="queue-dropdown"
        />
        <Dropdown
          options={wordNames}
          onSelect={(value) => {
            setWord(value);
          }}
          placeholder="Select a word"
          id="word-dropdown"
        />
        <WordCreator createNewWord={createNewWord} id="word-creator"/>
        {showGTWVEditor && (
          <GTWVEditor
            handleSubmit={(value) => {
              setShowGTWVEditor(false);
              addToTemplatePool(value.key, value.value, value.args);
            }}
            id="gtwv-editor"
          />
        )}
        <button
          onClick={() => {
            setShowGTWVEditor(!showGTWVEditor);
          }}
          id="toggle-gtwv-editor"
        >
          toggle GTWV Editor
        </button>

        {!loading && (
          <>
            <TemplateEditors
              postMessage={vscode.postMessage}
              generatorNames={generatorNames}
              configPath={CONFIG_PATH}
              filledGeneratorsFileText={filledGeneratorsFileText}
              templateModule={templateModule}
              allFileTemplates={allFileTemplates}
              runnableWords={runnableWords}
              templateDefinitions={[
                {
                  name: currentWordName,
                  wordSteps: currentWord,
                  meta: {
                    generators: generatorMeta,
                  },
                  subTemplate // added separately here bc it's for display purposes
                },
                {
                  name: "generators",
                  wordSteps: [{ result: {} }],
                  meta: {
                    generators: generatorMeta,
                  },
                },
              ]}
            />
          </>
        )}
      </CssVarsProvider>
    </div>
  );
};

export default App;
