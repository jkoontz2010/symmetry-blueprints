import { genTempl } from "./template-pool";
import { tts,
run,
orderedParse } from "symmetric-parser";
const template = {
'55bcd3d8a4_Untitled-1.ts/genTemplate01': ({genTemplate01})=>`
import { genTemplateWithVars, run } from "symmetric-parser";

// read this and then make a template pool from it
export const genTempl = genTemplateWithVars(
  {
    genTemplate: () => \`${run(genTemplate01, 'genTemplate01')}\`,
  },
  ["templName", "templateDesc","keys"]
);

// but we want these pools namespaced? maybe...maybe not.
// I'd say not.
export const selectorTempl = genTemplateWithVars(
  {
    selectorPre: () => \`
selectorName,\`,
  },
  ["selectorName"]
);

export const selectorFinTempl = genTemplateWithVars(
  {
    otherSelector: () => \`
selectorFinName\`,
  },
  ["selectorFinName"]
);

export const cssDecl = genTemplateWithVars(
  {
    cssDecl: () => \`
cssSelectors {
    cssRules
  }\`,
  },
  ["cssSelectors", "cssRules"]
);

export const bgRule = genTemplateWithVars(
  {
    cssBg: () => \`background-color: bgValue;\`,
  },
  ["bgValue"]
);


export const random = genTemplateWithVars({
'random': ()=>\`some thing here\`
}, ["thing"]);
export const randomParser = genTemplateWithVars({
'randomParser': ()=>\`we have so much to parse\`
}, ["so","to"]);
export const firsty = genTemplateWithVars({
'firsty': ()=>\`this is the way\`
}, ["the"]);
export const secondy = genTemplateWithVars({
'secondy': ()=>\`another one for me\`
}, ["one"]);
export const funcDef = genTemplateWithVars({
'funcDef': ()=>\`function name(args) { body }\`
}, ["name","args","body"]);
export const funcDefi = genTemplateWithVars({
'funcDefi': ()=>\`export function name(args) {body}\`
}, ["name","args","body"]);
export const arrayDef = genTemplateWithVars({
'arrayDef': ()=>\`[arrayElements]\`
}, ["arrayElements"]);
export const arrayEl = genTemplateWithVars({
'arrayEl': ()=>\`element\`
}, ["element"]);
export const testOne = genTemplateWithVars({
'testOne': ()=>\`test time for me\`
}, ["time"]);`,
'genTemplate01/templName01,templateDesc01,keys01': ({templName01, templateDesc01, keys01})=>`
const ${run(templName01,'templName01')} = genTemplateWithVars({
  ${run(templateDesc01,'templateDesc01')}},
  ${run(keys01,'keys01')}
  )`,
'keys01': ()=>`keys`,
'templName01': ()=>`templName`,
'templateDesc01': ()=>`templateDesc`
};
// @ts-ignore
const result = orderedParse(template, [genTempl]);
console.log(tts(result,false));