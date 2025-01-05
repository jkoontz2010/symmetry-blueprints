
import { genTemplateWithVars, run } from "symmetric-parser";


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

export const arrayDef = genTemplateWithVars({
'arrayDef': ()=>`[arrayElements]`
}, ["arrayElements"]);

export const fsPaths = genTemplateWithVars({
'fsPaths': ()=>`filePath`
}, ["filePath"]);
export const panelPath = {
'filePath1': ()=>`/Users/jaykoontz/Documents/GitHub/symmetric-blueprints/src/panel.ts`
}
export const servicesPath = {
'filePath1': ()=>`src/services`
}
export const panelSrcFile = {
'filePath1': ()=>`src/panel.ts`
}
export const useTemplatePath = {
'filePath1': ()=>`src/webview/hooks/useTemplate.ts`
}
export const allButPools = {
'excludePath1': ()=>`pools`,
'excludePath2': ()=>`hardToParse`,
'filePath1': ()=>`src`
}