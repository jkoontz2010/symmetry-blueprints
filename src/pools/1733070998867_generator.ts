import { funcDef,
funcDefi } from "./template-pool";
import { tts,
run,
orderedParse } from "symmetric-parser";
const template = {
'45008f01c7_firsty.ts': ()=>`export function firsty(one:string, two:string) {
    return one + two;
}`
};
// @ts-ignore
const result = orderedParse(template, [funcDefi]);
console.log(tts(result,false));