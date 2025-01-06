import { buildQueue, getQueue, clearQueue } from "./word-pool";
import { commandSend } from "./template-pool";

import {  tts,
run,
orderedParse } from "symmetric-parser";


const template = {
'arrayDef1/arrayElements1': ({ arrayElements1 }) => `[${run(arrayElements1, "arrayElements1")}]`,
'arrayElements1/fda1': ({ fda1 }) => `${run(fda1, "fda1")}`,
'fda1': () => "asdf"
};
// @ts-ignore
const result = orderedParse(template, [commandSend]);
const queue=getQueue();
console.log(tts(result,false));
if(queue.length>0) {
console.log("|||||||");
queue.forEach(q=>console.log(tts(q,false),"&&&&&&&"))}
clearQueue();