import { postCmdArgument,
argProperties,
nameProperty,
commandSend } from "./template-pool";
import { orderedParse,
performOnNodes } from "symmetric-parser";
import flow from 'lodash/flow'







export const run2 = flow((template)=>orderedParse(template, [commandSend,nameProperty,argProperties]))
export const r3 = flow((template)=>orderedParse(template, [commandSend,nameProperty,argProperties]))
export const tesRunWord = flow((template)=>run2(template))
export const fullTest = flow((template)=>orderedParse(template, [postCmdArgument]))

export const ponTester2 = flow((template)=>orderedParse(template, [commandSend]),(template)=>performOnNodes(template, "commandBody", fullTest))
export const blank828960 = flow()