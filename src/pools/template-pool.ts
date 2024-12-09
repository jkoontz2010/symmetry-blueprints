
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
export const firstyThisWay = genTemplateWithVars({
'firstyThisWay': ()=>`export const funcName(funcArgs) {funcBody}`
}, ["funcName","funcArgs","funcBody"]);

export const elementTag = genTemplateWithVars({
'elementTag': ()=>`<tagBody>`
}, ["tagBody"]);

export const commandSend = genTemplateWithVars({
'commandSend': ()=>`postMessage({commandBody});`
}, ["commandBody"]);
export const nameProperty = genTemplateWithVars({
'nameProperty': ()=>`command: "commandName",`
}, ["commandName"]);
export const argProperties = genTemplateWithVars({
'argProperties': ()=>`  commandArg,\n`
}, ["commandArg"]);
export const postMessageSend = {
'commandSend02/commandBody02': ({commandBody02})=>`postMessage({${run(commandBody02,'commandBody02')}});`,
'commandBody02/nameProperty11': ({nameProperty11})=>`
      ${run(nameProperty11, 'nameProperty11')}
      generatorRunFile,
      generatorString,
      pathToConfig: CONFIG_PATH,
      msgId,
    `,
'nameProperty11/commandName11': ({commandName11})=>`command: "${run(commandName11,'commandName11')}",`,
'commandName11': ()=>`run_generator`
}
export const postMessageArgs = {
'commandBody02/nameProperty11': ({ nameProperty11 }) => `
      ${run(nameProperty11, "nameProperty11")}
      generatorRunFile,
      generatorString,
      pathToConfig: CONFIG_PATH,
      msgId,
    `,
'nameProperty11/commandName11': ({ commandName11 }) => `command: "${run(commandName11, "commandName11")}",`
}