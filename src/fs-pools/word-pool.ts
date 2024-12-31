import { useTemplatePath,
panelSrcFile,
servicesPath,
panelPath } from "./template-pool";
import { orderedParse,

performOnNodes, 
insertIntoTemplate} from "symmetric-parser";
import flow from 'lodash/flow'




export const getServices = flow((template)=>insertIntoTemplate(template, servicesPath))
export const getPanel = flow((template)=>insertIntoTemplate(template, panelSrcFile))
export const getUseTemplate = flow((template)=>insertIntoTemplate(template, useTemplatePath))