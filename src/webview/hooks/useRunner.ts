import { customAlphabet } from "nanoid";
import React, { useEffect, useState } from "react";
import {
  genTemplateWithVars,
  tts,
  argsAndTemplateToFunction,
} from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

export function useRunner(
  postMessage: any,
  configPath: string,
  filledGeneratorsFileText: string
) {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 4);
  //console.log("TEST??",filledGeneratorsFileText)
  const [msgId, setMsgId] = useState(nanoid());
  const [generatorModule, setGeneratorModule] = React.useState<any>({});
  const [templateModule, setTemplateModule] = React.useState<any>(null);
  const [wordModule, setWordModule] = React.useState<any>(null);
  const [filledGenerators, setFilledGenerators] = React.useState<Template>(
    new Function("return " + filledGeneratorsFileText)()
  );
  //console.log("FILLED GENERATORs", filledGenerators)
  useEffect(() => {
    setFilledGenerators(new Function("return " + filledGeneratorsFileText)());
  }, [filledGeneratorsFileText]);
  const fetchGenerators = async () => {
    const data = await import("../../pools/utility-templates");
    setGeneratorModule(data);
  };
  const fetchTemplates = async () => {
    const data = await import("../../pools/template-pool");
    //console.log("AFTER IMPORT", data);
    // @ts-ignore
    //console.log("GOOD LUCK", data);
    setTemplateModule(data);
  };

  useEffect(() => {
    fetchGenerators();
    fetchTemplates();
  }, []);

  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.data.data.msgId !== msgId) return;
      const message = event.data; // The json data that the extension sent
      switch (message.command) {
        case "all_filled_generators": {
          //console.log("all_filled_generators", message.data);
          const { allFilledGenerators } = message.data;
          setFilledGenerators(new Function("return " + allFilledGenerators)());
          //console.log("NEW ALL FILELD",new Function("return " + allFilledGenerators)())
          break;
        }
      }
    });
  }, []);

  const addToTemplatePool = (key: string, value: string, args: string[]) => {
    const funcPart = argsAndTemplateToFunction([], value);
    const templ = { [key]: funcPart };
    const template = genTemplateWithVars(templ, args);
    //console.log("addToTemplatePool", template);
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

  const addToFilledGeneratorPool = (filledGenerator: Template) => {
    if (Object.keys(filledGenerator).length !== 1) {
      throw new Error("Filled generator must have exactly one key");
    } else {
      postMessage({
        command: "add_filled_generator",
        pathToConfig: configPath,
        filledGenerator: tts(filledGenerator, false),
        msgId,
      });
    }
  };

  const handleSaveAllFiles = (template: Template) => {
    postMessage({
      command: "save_all_files",
      pathToConfig: configPath,
      template: tts(template),
    });
  };

  //console.log("here we are", generatorModule, templateModule, wordModule);

  return {
    templateModule,
    handleSaveAllFiles,
    generatorModule,
    wordModule,
    filledGenerators,
    addToTemplatePool,
    addToFilledGeneratorPool,
  };
}
