
import { genTemplateWithVars, tts } from "symmetric-parser";
import { mainImport } from "./testImport.js";


function main(str:string) {
    mainImport(str, true);
    const first = genTemplateWithVars({
        first: ()=>`some thing here`,
    },["thing"]);
    console.log(first, tts(first,false))
}

main("Hello, world!");

