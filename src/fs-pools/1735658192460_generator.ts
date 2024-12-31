import { panelPath } from "./template-pool";

import {  tts,
run,
dumbCombine } from "symmetric-parser";


const template = {

};
// @ts-ignore
const result = dumbCombine(template, panelPath);
console.log(tts(result,false));