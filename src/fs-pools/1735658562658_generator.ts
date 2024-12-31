import { panelSrcFile } from "./template-pool";

import {  tts,
run,
dumbCombine } from "symmetric-parser";


const template = {

};
// @ts-ignore
const result = dumbCombine(template, panelSrcFile);
console.log(tts(result,false));