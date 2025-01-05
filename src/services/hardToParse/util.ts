// can HGCG parse itself? NOPE! HAHA (crying internall)
// put the parse tokens here dumbass
export const RESULT_SPLITTER = "|||||||"
export const QUEUE_SPLITTER ="&&&&&&&"
export function formWordRunFile(wordName: string, template: string): string {
    return `import { getQueue, clearQueue, ${wordName} } from "./word-pool";\nimport { tts } from "symmetric-parser";
    function run(func: () => string, keyName: string) {
    try {
      if (func == null) {
        return "\${run(" + keyName + ", '" + keyName + "')}";
      }
      if (typeof func === "string") {
        throw new Error("func is string");
      }
      const result = func();
      return result;
    } catch (e) {
      return "\${run(" + keyName + ", '" + keyName + "')}";
    }
  }
    \nconst template = ${template};\nconst result = ${wordName}(template);\nconst queue=getQueue();\nconsole.log(tts(result, false));\nif(queue.length>0) {\nconsole.log("|||||||");\nqueue.forEach(q=>console.log(tts(q,false),"&&&&&&&"))}\nclearQueue();`;
  }