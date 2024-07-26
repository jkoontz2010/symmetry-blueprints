import * as React from "react";
import { Template } from "symmetric-parser/dist/src/templator/template-group";
import BuilderAccordion from "./BuilderAccordion";
import { CssVarsProvider } from "@mui/joy";
import { useFileSystem } from "../hooks/useFileSystem";

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

const App = () => {
  const { readAllFiles, generatorsFileText, templatesFileText, wordsFileText } = useFileSystem(vscode.postMessage, "/Users/jaykoontz/Documents/GitHub/symmetric-blueprints/.spconfig");
  React.useEffect(() => {
    readAllFiles();
  }, []);
  return (
    <div>
      <CssVarsProvider>
        <BuilderAccordion 
          generatorsFileText={generatorsFileText} 
          templatesFileText={templatesFileText} 
          wordsFileText={wordsFileText} 
        />
      </CssVarsProvider>
    </div>
  );
};

export default App;
