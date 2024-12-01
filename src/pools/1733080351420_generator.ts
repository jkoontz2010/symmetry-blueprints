import {  } from "./template-pool";
import { tts,
run,
joiner } from "symmetric-parser";
const template = {
'arrayDef1/arrayElements1': ({arrayElements1})=>`[${run(arrayElements1, 'arrayElements1')}]`,
'arrayElements1/lkj1,jkl1': ({lkj1, jkl1})=>`${run(lkj1,'lkj1')}${run(jkl1,'jkl1')}`,
'jkl1': ()=>`jkl`,
'lkj1': ()=>`lkj`
};
// @ts-ignore
const result = joiner(template, "arrayElements", "arrayElements", ",");
console.log(tts(result,false));