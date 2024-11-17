import React, { useEffect } from "react";
import { genTemplateWithVars, tts, argsAndTemplateToFunction } from "symmetric-parser";
import {  Template } from "symmetric-parser/dist/src/templator/template-group";

export function useRunner(postMessage: any, configPath: string) {
  const [generatorModule, setGeneratorModule] = React.useState<any>(null);
  const [templateModule, setTemplateModule] = React.useState<any>(null);
  const [wordModule, setWordModule] = React.useState<any>(null);

  const fetchGenerators = async () => {
    const data = await import("../../pools/utility-templates");
    setGeneratorModule(data);
  };
  const fetchTemplates = async () => {
    const data = await import("../../pools/template-pool");
    console.log("AFTER IMPORT", data);
    // @ts-ignore
    console.log("GOOD LUCK", data);
    setTemplateModule(data);
  };
  const fetchWords = async () => {
    const data = await import("../../pools/word-pool");
    setWordModule(data);
  };
  useEffect(() => {
    fetchGenerators();
    fetchTemplates();
    fetchWords();
  }, []);

  const addToTemplatePool = (key: string, value: string, args: string[]) => {
    const funcPart = argsAndTemplateToFunction([], value);
    const templ = { [key]: funcPart };
    const template = genTemplateWithVars(templ, args);
    console.log("addToTemplatePool", template);
    if (templateModule[key] != null) {
      throw new Error("Template with this name already exists");
    }
    setTemplateModule((prev) => {
      return {
        ...prev,
        ...{ [key]: template },
      };
    });
    postMessage({
      command: "add_template",
      key,
      args: JSON.stringify(args),
      value,
      pathToConfig: configPath,
    });
  };

  //console.log("here we are", generatorModule, templateModule, wordModule);

  return {
    templateModule,
    generatorModule,
    wordModule,
    addToTemplatePool,
  };
}
