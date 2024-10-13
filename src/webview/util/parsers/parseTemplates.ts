import { collapseTemplateAtKey, genTemplateWithVars, joiner, recursiveFold, replaceWithAllIsomorphic, stringCleaning, stringUnCleaning } from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

export function parseTemplates(file: Template) {
    // need to parse out `...`
    const template = genTemplateWithVars(
      {
        templateDefinition: () => `export const templateName = {templateBody\n};`,
      },
      ["templateName", "templateBody"]
    );
    // parsing itself, look at it go!
    const gendTemplate = genTemplateWithVars(
      {
        genTemplate: () =>
          `export const templateName = genTemplateWithVars(\n  {templateBody},\n  [genVars]\n);`,
      },
      ["templateName", "templateBody", "genVars"]
    );
    const fr = recursiveFold(
      file,
      [template, gendTemplate], // sort by how specific something is... huh
      [],
      { scope: () => `\n` },
      "  ",
      1
    );
    //console.log(stringUnCleaning(tts(fr?.result ?? {})));
    // /console.log(stringUnCleaning(tts(fr?.divisors ?? {})));
    return { ...fr.result, ...fr.divisors };
  }


const templateMeta = genTemplateWithVars(
    {
      templateDefinition: () =>
        `{ name: "templateName", template: { templateBody } },`,
    },
    ["templateName", "templateBody"]
  );
  
  const genTemplateMeta = genTemplateWithVars(
    {
      genTemplate: () =>
        `{ name: "templateName", template: { templateBody }, vars: [genVars] },`,
    },
    ["templateName", "templateBody", "genVars"]
  );
  export function buildTemplateMeta(templateFile: string) {
    const cleaned = stringCleaning(templateFile);
    const file = { file: () => cleaned };
    const parsed = parseTemplates(file);
  
    const theMetaIso = replaceWithAllIsomorphic(parsed, [templateMeta]);
    const theMetaIso2 = replaceWithAllIsomorphic(theMetaIso, [genTemplateMeta]);
  
    const collapsed = collapseTemplateAtKey(theMetaIso2, "templateDefinition");
    const theStaticMeta = joiner(collapsed, "templateDefinition", "metas", "\n");
    const theGenMeta = joiner(collapsed, "genTemplate", "metas", "\n");
  
    const templatesString = stringUnCleaning(
      "[" + theStaticMeta["metas"]() + ", " + theGenMeta["metas"]() + "]"
    );
  
    return eval(templatesString);
  }
  
  