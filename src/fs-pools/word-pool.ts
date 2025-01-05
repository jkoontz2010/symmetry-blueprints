import { useTemplatePath,
panelSrcFile,
servicesPath,
panelPath } from "./template-pool";
import { orderedParse,

performOnNodes, 
insertIntoTemplate} from "symmetric-parser";
import flow from 'lodash/flow'
import type { Template } from "../../../react-for-code/dist/src/templator/template-group";


let QUEUE: Template[]=[]
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

export const getServices = flow((template)=>insertIntoTemplate(template, servicesPath))
export const getPanel = flow((template)=>insertIntoTemplate(template, panelSrcFile))
export const getUseTemplate = flow((template)=>insertIntoTemplate(template, useTemplatePath))