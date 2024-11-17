import { cloneDeep, difference } from "lodash";
import { useState } from "react";
import {
  appendKeyToKey,
  dumbCombine,
  insertIntoTemplate,
  sortTemplateByDeps,
} from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

export type WordStep = {
  name: string;
  args: any[];
  result: Template;
};

export function useTemplate(
  templateInit: Template,
  templateModule: any,
  generatorModule: any,
  wordModule: any
) {
  let [template, setTemplate] = useState<Template>(templateInit);
  const [wordSteps, setWordSteps] = useState<WordStep[]>([
    { name: "init", args: [], result: template },
  ]);
  function logStep(name, args, result) {
    const wordStep = {
      name: name,
      args: args,
      result: cloneDeep(result),
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
    console.log("insertTemplateIntoTemplateAtKey", templateToInsert, toKey, template)
    const oldKeys = Object.keys(template);
    let newTemplate = insertIntoTemplate(template, templateToInsert);
    logStep("insertIntoTemplate", [template, templateToInsert], newTemplate);

    const newKeys = Object.keys(newTemplate);
    const newestKey = newKeys.filter((k) => !oldKeys.includes(k))[0]?.split("/")[0];
    console.log("NEWEST KEY", newestKey)
    let appendedTemplate = appendKeyToKey(newTemplate, newestKey, toKey);
    const result = sortTemplateByDeps(sortTemplateByDeps(appendedTemplate));
    logStep("appendKeyToKey", [newTemplate, newestKey, toKey], result);
    setTemplate(result);
  }

  function applyGeneratorString(generatorString: string) {
    function evalInScope(js, contextAsScope) {
      return new Function(
        `with (this) { console.log("CONTEXT IS",this); return (${js}); }`
      ).call(contextAsScope);
    }
console.log("WHATS IN TEMPLATE MODULE", templateModule)
    const result = evalInScope(generatorString, {
      template,
      ...templateModule,
      ...generatorModule,
      ...wordModule,
    });

    const name = generatorString.substring(0, generatorString.indexOf("("));
    const args = generatorString
      .substring(generatorString.indexOf("(") + 1, generatorString.indexOf(")"))
      .split(",")
      .map((arg) => eval(arg));
    logStep(name, args, result);
    setTemplate(result)
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
