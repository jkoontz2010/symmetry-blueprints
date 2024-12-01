import {  } from "./template-pool";
import { tts,
run,
joiner } from "symmetric-parser";
const template = {
'arrayDef1/arrayElements1': ({arrayElements1})=>`[${run(arrayElements1, 'arrayElements1')}]`,
'arrayElements1/asdf1,fdsa1': ({asdf1, fdsa1})=>`${run(asdf1,'asdf1')}${run(fdsa1,'fdsa1')}`,
'asdf1': ()=>`asdf`,
'fdsa1': ()=>`fdsa`
};
// @ts-ignore
const result = joiner(template, "arrayElements", "arrayElements", ",");
console.log(tts(result,false));