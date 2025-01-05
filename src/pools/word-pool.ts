import { hookCommandHandler,
webviewCommandHandler,
webviewPostMessageName,
webviewPostMessage,
argProperties,
nameProperty,
commandSend,
cmdHandler,
panelCommand,
postCmdArgument } from "./template-pool";
import { orderedParse,
appendKeyToKey,
dumbCombine,
performOnNodes } from "symmetric-parser";
import flow from 'lodash/flow'



import type { Template } from "../../../react-for-code/dist/src/templator/template-group";


let QUEUE: Template[]=[]
// DO NOT PLACE CONSOLE LOGS HERE EVER
export function buildQueue(template: Template) {
    QUEUE.push(template)
    return template
}
export function getQueue() {
    return QUEUE
}
export function clearQueue() {
    QUEUE=[]
}   

export const run2 = flow((template)=>orderedParse(template, [commandSend,nameProperty,argProperties]))
export const r3 = flow((template)=>orderedParse(template, [commandSend,nameProperty,argProperties]))
export const tesRunWord = flow((template)=>run2(template))
export const fullTest = flow((template)=>orderedParse(template, [postCmdArgument]))
export const ponQueuer = flow((template)=>fullTest(template),(template)=>buildQueue(template))
export const ponTester2 = flow((template)=>orderedParse(template, [commandSend]),(template)=>performOnNodes(template, "commandBody", fullTest))
export const blank828960 = flow()
export const ponTesterQueue = flow((template)=>orderedParse(template, [commandSend]),(template)=>performOnNodes(template, "commandBody", ponQueuer))
export const fromParserTest = flow(
    (template) => orderedParse(template, [commandSend]),
    (template) =>
      performOnNodes(template, "commandBody", (t) =>
        orderedParse(t, [nameProperty])
      ),
    (template) => orderedParse(template, [webviewCommandHandler]),
    (template) =>
      performOnNodes(template, "webviewHandler", (t) => {
        return orderedParse(t, [panelCommand, webviewPostMessageName]);
      }),
    (template) => orderedParse(template, [hookCommandHandler]),
  
    (template) =>
      performOnNodes(template, "hookCommandHandlerBody", (t) => {
        //    console.log("CMD HANDLER", tts(t, false));
        const res = orderedParse(t, [cmdHandler]);
        //  console.log("CMD HANDLER RES", tts(res, false));
        return res;
      })
  )
export const blank243759 = flow()
export const blank383058 = flow()
