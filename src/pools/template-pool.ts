
import { genTemplateWithVars, run } from "symmetric-parser";

export const DONT_USE = {
  "genTemplate/templName,templateDesc,keys": ({
    templName,
    templateDesc,
    keys,
  }) => `
const ${run(templName, "templName")} = genTemplateWithVars({
  ${run(templateDesc, "templateDesc")}},
  ${run(keys, "keys")})`,
};

// read this and then make a template pool from it
export const genTempl = genTemplateWithVars(
  {
    genTemplate: () => `
const templName = genTemplateWithVars({
  templateDesc},
  keys
  )`,
  },
  ["templName", "templateDesc","keys"]
);

// but we want these pools namespaced? maybe...maybe not.
// I'd say not.
export const selectorTempl = genTemplateWithVars(
  {
    selectorPre: () => `\nselectorName,`,
  },
  ["selectorName"]
);

export const selectorFinTempl = genTemplateWithVars(
  {
    otherSelector: () => `\nselectorFinName`,
  },
  ["selectorFinName"]
);

export const cssDecl = genTemplateWithVars(
  {
    cssDecl: () => `\ncssSelectors {
    cssRules
  }`,
  },
  ["cssSelectors", "cssRules"]
);

export const bgRule = genTemplateWithVars(
  {
    cssBg: () => `background-color: bgValue;`,
  },
  ["bgValue"]
);


export const random = genTemplateWithVars({
'random': ()=>`some thing here`
}, ["thing"]);
export const randomParser = genTemplateWithVars({
'randomParser': ()=>`we have so much to parse`
}, ["so","to"]);
export const firsty = genTemplateWithVars({
'firsty': ()=>`this is the way`
}, ["the"]);
export const secondy = genTemplateWithVars({
'secondy': ()=>`another one for me`
}, ["one"]);
export const funcDef = genTemplateWithVars({
'funcDef': ()=>`function name(args) { body }`
}, ["name","args","body"]);
export const funcDefi = genTemplateWithVars({
'funcDefi': ()=>`export function name(args) {body}`
}, ["name","args","body"]);