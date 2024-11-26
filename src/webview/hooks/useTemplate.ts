import { cloneDeep, difference, last, uniqueId } from "lodash";
import { useEffect, useState } from "react";
import {
  appendKeyToKey,
  dumbCombine,
  insertIntoTemplate,
  sortTemplateByDeps,
} from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";
import { formGeneratorFile } from "./hgcgUtil";
import { CONFIG_PATH } from "../components/App";
import { customAlphabet } from "nanoid";
import { WordDefinition } from "../components/TemplateTree";

export type WordStep = {
  name?: string;
  args?: any[];
  result: Template;
};

export function useTemplate(
  definition: WordDefinition,
  templateModule: any,
  generatorModule: any,
  wordModule: any,
  postMessage: any
) {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 4);

  const [msgId, setMsgId] = useState(nanoid());
  let [template, setTemplate] = useState<Template>(
    last(definition.wordSteps).result
  );
  const [wordSteps, setWordSteps] = useState<WordStep[]>([
    last(definition.wordSteps),
  ]);
  function logStep(name, args, result, files = {}) {
    const wordStep = {
      name: name,
      args: args,
      result: cloneDeep(result),
      files,
    };
    setWordSteps([...wordSteps, wordStep]);
  }

  function removeKey(key: string) {
    const newTemplate = cloneDeep(template);
    delete newTemplate[key];
    setTemplate(newTemplate);
  }
  function addKey(key: string) {
    const templateHasNumerator = Object.keys(template).some((k) => {
      return k.split("/")[0] === key;
    });
    if (templateHasNumerator) return;
    let combineWith = { [key]: () => `` };
    let newTemplate = dumbCombine(template, combineWith);
    let result = sortTemplateByDeps(sortTemplateByDeps(newTemplate));
    logStep("dumbCombine", [template, combineWith], result);
    setTemplate(result);
  }

  function addKeyToNumerator(appendKey: string, toKey: string) {
    const fullToKey = Object.keys(template).find(
      (k) => k.split("/")[0] === toKey
    );
    if (fullToKey != null) {
      // check that the appendKey isn't already in there
      const denoms = fullToKey.split("/")[1]?.split(",");
      if (denoms?.includes(appendKey)) {
        return;
      }
    }
    let newTemplate = appendKeyToKey(template, appendKey, toKey);
    let result = sortTemplateByDeps(sortTemplateByDeps(newTemplate));
    logStep("appendKeyToKey", [template, appendKey, toKey], result);

    setTemplate(result);
  }

  function insertTemplateIntoTemplate(templateToInsert: Template) {
    console.log("inserting template into template", templateToInsert);
    let newTemplate = insertIntoTemplate(template, templateToInsert);
    let result = sortTemplateByDeps(sortTemplateByDeps(newTemplate));
    logStep("insertIntoTemplate", [template, templateToInsert], result);

    setTemplate(result);
  }
  function insertTemplateIntoTemplateAtKey(
    templateToInsert: Template,
    toKey: string
  ) {
    console.log(
      "insertTemplateIntoTemplateAtKey",
      templateToInsert,
      toKey,
      template
    );
    const oldKeys = Object.keys(template);
    let newTemplate = insertIntoTemplate(template, templateToInsert);
    logStep("insertIntoTemplate", [template, templateToInsert], newTemplate);

    const newKeys = Object.keys(newTemplate);
    const newestKey = newKeys
      .filter((k) => !oldKeys.includes(k))[0]
      ?.split("/")[0];
    console.log("NEWEST KEY", newestKey);
    let appendedTemplate = appendKeyToKey(newTemplate, newestKey, toKey);
    const result = sortTemplateByDeps(sortTemplateByDeps(appendedTemplate));
    logStep("appendKeyToKey", [newTemplate, newestKey, toKey], result);
    setTemplate(result);
  }
  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.data.data.msgId !== msgId) return;
      const message = event.data; // The json data that the extension sent
      switch (message.command) {
        case "generator_result":
          console.log("MESSAGE DATA", message.data);
          const { generatorFilePath, resultFilePath, result, generatorString } =
            message.data;
          console.log("generator_result", result);
          const name = generatorString.substring(
            0,
            generatorString.indexOf("(")
          );

          const args = generatorString
            .substring(
              generatorString.indexOf("(") + 1,
              generatorString.indexOf(")")
            )
            .split(",");

          logStep(name, args, result, {
            generatorFilePath,
            resultFilePath,
          });
          setTemplate(new Function("return " + result)());
          break;
      }
    });
  }, []);
  function applyGeneratorString(generatorString: string) {
    // form it and send it over
    const generatorRunFile = formGeneratorFile(
      generatorString,
      template,
      templateModule,
      generatorModule
    );
    // send it over via postMessage
    postMessage({
      command: "run_generator",
      generatorRunFile,
      generatorString,
      pathToConfig: CONFIG_PATH,
      msgId,
    });
  }
  console.log("Word steps", wordSteps);
  return {
    template,
    addKey,
    addKeyToNumerator,
    insertTemplateIntoTemplate,
    insertTemplateIntoTemplateAtKey,
    wordSteps,
    applyGeneratorString,
    removeKey,
  };
}
