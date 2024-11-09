import { useState } from "react";
import {
  appendKeyToKey,
  dumbCombine,
  sortTemplateByDeps,
} from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

export function useTemplate(templateString: string) {
  let [template, setTemplate] = useState<Template>(
    new Function(`return ${templateString}`)()
  );

  function addKey(key: string) {
    const templateHasNumerator = Object.keys(template).some((k) => {
      return k.split("/")[0] === key;
    });
    if (templateHasNumerator) return;
    let newTemplate = dumbCombine(template, { [key]: () => `new key` });
    setTemplate(sortTemplateByDeps(sortTemplateByDeps(newTemplate)));
  }

  function addKeyToNumerator(appendKey: string, toKey: string) {
    const fullToKey = Object.keys(template).find((k) => k.split("/")[0] === toKey);
    if(fullToKey!= null) {
        // check that the appendKey isn't already in there
        const denoms = fullToKey.split("/")[1]?.split(",");
        if(denoms?.includes(appendKey)) {
            return;
        }
    }
    let newTemplate = appendKeyToKey(template, appendKey, toKey);
    setTemplate(sortTemplateByDeps(sortTemplateByDeps(newTemplate)));
  }

  return {
    template,
    addKey,
    addKeyToNumerator
  };
}
