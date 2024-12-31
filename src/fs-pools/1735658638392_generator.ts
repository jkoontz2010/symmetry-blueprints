import { useTemplatePath } from "./template-pool";

import {  tts,
run,
dumbCombine } from "symmetric-parser";


const template = {

};
// @ts-ignore
const result = dumbCombine(template, useTemplatePath);
console.log(tts(result,false));