import { postCmdArgument } from "./template-pool";

import {  tts,
run,
orderedParse } from "symmetric-parser";


const template = {
'commandBody03': () => `
        command: "add_filled_generator",
        generatorRunFile,
        generatorString,
        pathToConfig: CONFIG_PATH,
        msgId,
      `
};
// @ts-ignore
const result = orderedParse(template, [postCmdArgument]);
console.log(tts(result,false));