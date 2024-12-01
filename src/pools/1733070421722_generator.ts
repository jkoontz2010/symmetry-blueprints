import {  } from "./template-pool";
import { tts,
run,
orderedParse } from "symmetric-parser";
const template = {
'step1/genArgs1': ({genArgs1})=>`orderedParse(template, ${run(genArgs1, 'genArgs1')})`,
'genArgs1/argsf1': ({argsf1})=>`${run(argsf1,'argsf1')}`,
'argsf1': ()=>`[funcDefi]`
};
// @ts-ignore
const result = orderedParse(template, [funcDefi]);
console.log(tts(result,false));