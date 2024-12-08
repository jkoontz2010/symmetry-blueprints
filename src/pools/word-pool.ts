import { argProperties,
nameProperty,
commandSend } from "./template-pool";
import { orderedParse } from "symmetric-parser";
import flow from 'lodash/flow'



export const run2 = flow((template)=>orderedParse(template, [commandSend,nameProperty,argProperties]))
export const r3 = flow((template)=>orderedParse(template, [commandSend,nameProperty,argProperties]))
export const tesRunWord = flow((template)=>run2(template))