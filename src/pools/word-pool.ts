import { postCmdArgument,
argProperties,
nameProperty,
commandSend } from "./template-pool";
import { orderedParse,
performOnNodes } from "symmetric-parser";
import flow from 'lodash/flow'


import type { Template } from "../../../react-for-code/dist/src/templator/template-group";


let QUEUE: Template[]=[]
function buildQueue(template: Template) {
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

export const blank243759 = flow()
export const blank383058 = flow()