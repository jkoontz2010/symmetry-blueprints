import { getQueue, clearQueue, getUseTemplate } from "./word-pool";
import { tts } from "symmetric-parser";
  function run(func: () => string, keyName: string) {
  try {
    if (func == null) {
      return "${run(" + keyName + ", '" + keyName + "')}";
    }
    if (typeof func === "string") {
      throw new Error("func is string");
    }
    const result = func();
    return result;
  } catch (e) {
    return "${run(" + keyName + ", '" + keyName + "')}";
  }
}
  
const template = {};
const result = getUseTemplate(template);
const queue=getQueue();
console.log(tts(result, false));
if(queue.length>0) {
console.log("|||||||");
queue.forEach(q=>console.log(tts(q,false),"&&&&&&&"))}
clearQueue();