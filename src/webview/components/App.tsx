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

const sendMessage = () => {
  console.log("button clicked");
  vscode.postMessage({ command: "testing" });
};

const firsty: Template = {
  firsty: () => `this is where we do it`,
};

const playTemplate = `({ 
    'shop1/would1,test1': ({would1, test1})=>\`how \${run(would1, 'would1')} you \${run(test1, 'test1')} this too\`, 
    'shop2/would2,test2': ({would2, test2})=>\`how \${run(would2, 'would2')} you \${run(test2, 'test2')} this too\`, 
    'shop3/would3,test3': ({would3, test3})=>\`how \${run(would3, 'would3')} you \${run(test3, 'test3')} this too\`, 
    'something1': ()=>\`some value\`, 
    'something2': ()=>\`another one!\` 
  })`;

  export const CONFIG_PATH ="/Users/jaykoontz/Documents/GitHub/symmetric-blueprints/.spconfig"
const App = () => {
  const { readAllFiles, generatorsFileText, templatesFileText, wordsFileText } =
    useFileSystem(
      vscode.postMessage,
      CONFIG_PATH
    );
  React.useEffect(() => {
    readAllFiles();
  }, []);
  const templ = new Function("return " + playTemplate)();
  //console.log("generatorsFileText", generatorsFileText);
  return (
    <div>
      <CssVarsProvider>
        {generatorsFileText != null && (
          <TemplateEditors
          postMessage={vscode.postMessage}
          configPath={CONFIG_PATH}
            templateDefinitions={[
              {
                name: "input",
                templateInit: templ,
                meta: {
                  generators: buildAllGeneratorsTemplate(generatorsFileText),
                },
              },
              {
                name: "generators",
                templateInit: {},
                meta: {
                  generators: buildAllGeneratorsTemplate(generatorsFileText),
                },
              },
            ]}
          />
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
