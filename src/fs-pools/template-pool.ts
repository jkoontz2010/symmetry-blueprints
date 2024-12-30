
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
