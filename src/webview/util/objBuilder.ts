import { combineTemplatePairs, findPairs, genTemplateWithVars, getKeyName, combine, fillTemplateWithMappedKeys, performOnNodes } from "symmetric-parser";

import { BuilderWord } from "../hooks/useWordBuilder";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

const wordTemplate = genTemplateWithVars({
	wordMeta: ()=> `{
	name: "wordName",
	steps: [wordSteps]
}`
},["wordName","wordSteps"])

const wordStepTemplate = genTemplateWithVars({
	wordSteps: ()=>`{
	name: "stepName",
	inputs: {stepInputs},
	generator: stepGenerator,
	outputName: "stepOutputName",
  },`
},["stepName", "stepInputs", "stepGenerator", "stepOutputName"])

// need to rename key to stepInputs once we're ready
const wordStepInputsTemplate = genTemplateWithVars({
	stepInputsDef: ()=>`\n  stepInputKey: stepInputValue,`
},["stepInputKey","stepInputValue"])


function buildWordMeta(template:Template): Template { 
    console.log("BUILD WORD META TEMPLTATE", template);
    const mapFromTo = [{
        template: template,
        fromToKeys: [
            { from: "elementName", to: "stepName"},
            { from: "word", to: "wordName"},
            { from: "genOutput", to: "stepOutputName"},
            {from: "genInputs", to: "stepInputs"},
        ],
        index: 1
    }]

    const mapped = fillTemplateWithMappedKeys(mapFromTo, template);
    console.log({mapped})
    return mapped
}
export function buildWordMetas(template:Template,root:string, keyMap: Record<string, string>):BuilderWord[] {
    
    //const pairings = combineTemplatePairs(findPairs(root, Object.keys(keyMap), template));
    //console.log("pairings", pairings);
    // @ts-ignore
    //const result: BuilderWord[] = pairings.map(buildWordMeta);
    const result = performOnNodes(root,template, buildWordMeta);
    console.log("result", result);
    const bw:BuilderWord[] = [];
    return bw;
}