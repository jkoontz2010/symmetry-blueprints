import { pathConfigPostArg } from "./template-pool";

import {  tts,
run,
orderedParse } from "symmetric-parser";


const template = {
'commandSend02/commandBody02': ({ commandBody02 }) => `postMessage({${run(commandBody02, "commandBody02")}});`,
'commandBody02/nameProperty11': ({ nameProperty11 }) => `
      ${run(nameProperty11, "nameProperty11")}
      generatorRunFile,
      generatorString,
      pathToConfig: CONFIG_PATH,
      msgId,
    `,
'nameProperty11/commandName11': ({ commandName11 }) => `command: "${run(commandName11, "commandName11")}",`,
'commandName11': () => "run_generator"
};
// @ts-ignore
const result = orderedParse(template, [pathConfigPostArg]);
console.log(tts(result,false));