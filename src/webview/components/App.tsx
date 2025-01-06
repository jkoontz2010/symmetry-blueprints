import * as React from "react";
import { Template } from "symmetric-parser/dist/src/templator/template-group";
import BuilderAccordion from "./BuilderAccordion";
import { CssVarsProvider } from "@mui/joy";
import { useFileSystem } from "../hooks/useFileSystem";
import TemplateDirect from "./v2";
import { TemplateEditors, TemplateTree } from "./TemplateTree";
import { useRunner } from "../hooks/useRunner";
import { tts } from "symmetric-parser";
import { buildAllGeneratorsTemplate } from "../util/parsers/parseGenerators";
import { WordStep } from "../hooks/useTemplate";
import { last } from "lodash";
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
    subTemplate
  } = useFileSystem(vscode.postMessage);
  React.useEffect(() => {
    readAllFiles("blank template");
  }, []);
  const [showGTWVEditor, setShowGTWVEditor] = React.useState(false);
  return (
    <div>
      <div><QueueHeader/></div>
      <CssVarsProvider>
        <Dropdown
          options={queueNames}
          onSelect={(value) => {
            selectQueue(value);
          }}
          placeholder="Select a word"
        />
        <Dropdown
          options={wordNames}
          onSelect={(value) => {
            setWord(value);
          }}
          placeholder="Select a word"
        />
        <WordCreator createNewWord={createNewWord} />
        {showGTWVEditor && (
          <GTWVEditor
            handleSubmit={(value) => {
              setShowGTWVEditor(false);
              addToTemplatePool(value.key, value.value, value.args);
            }}
          />
        )}
        <button
          onClick={() => {
            setShowGTWVEditor(!showGTWVEditor);
          }}
        >
          toggle GTWV Editor
        </button>

        {!loading && (
          <>
            <TemplateEditors
              postMessage={vscode.postMessage}
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
                    generators: buildAllGeneratorsTemplate(generatorsFileText),
                  },
                  subTemplate // added separately here bc it's for display purposes
                },
                {
                  name: "generators",
                  wordSteps: [{ result: {} }],
                  meta: {
                    generators: buildAllGeneratorsTemplate(generatorsFileText),
                  },
                },
              ]}
            />
          </>
        )}
        {/*<BuilderAccordion 
          generatorsFileText={generatorsFileText} 
          templatesFileText={templatesFileText} 
          wordsFileText={wordsFileText} 
          postMessage={vscode.postMessage}
        />*/}
      </CssVarsProvider>
    </div>
  );
};

export default App;
