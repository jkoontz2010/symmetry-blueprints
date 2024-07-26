import { genTemplateWithVars, recursiveFold, stringCleaning } from "symmetric-parser";

export function parseWords(wordFile: string) {
    const file = { file: () => wordFile };
  
    const words = genTemplateWithVars(
      {
        wordDef: () =>
          `function word(input: Template): Template {body\n  return outputName;\n}`,
      },
      ["word", "body", "outputName"]
    );

    const elements = genTemplateWithVars(
      {
        element: () => `const genOutput = elementName(genInputs);\n`, // very catch-able, be careful
      },
      ["elementName", "genInputs", "genOutput"]
    );
  
    const of = recursiveFold(
      file,
      [words, elements],
      [],
      { scope: () => `\n` },
      "  ",
      1
    );
    return {...of.result, ...of.divisors};
  }


export function parseGenerators(generatorFile: string) {
    const cleaned = stringCleaning(generatorFile);
    const file = { file: () => cleaned };
    const generator = genTemplateWithVars(
      {
        generator: () => `export function genName(genArgs): Template {genBody\n}`,
      },
      ["genName", "genArgs", "genBody"]
    );
    const fr = recursiveFold(
      file,
      [generator],
      [],
      { scope: () => `\n` },
      "  ",
      1
    );
    return {
        ...fr.result,
        ...fr.divisors
    }
}
  
  export function parseTemplates(templateFile: string) {
    const cleaned = stringCleaning(templateFile)
    const file = { file: () => cleaned };
    // need to parse out `...`
    const template = genTemplateWithVars(
      {
        templateStatic: () => `export const templateName = {templateBody\n};`,
      },
      ["templateName", "templateBody"]
    );
    // parsing itself, look at it go!
    const gendTemplate = genTemplateWithVars(
      {
        genTemplate: () => `export const genName = genTemplateWithVars(\n  {genInputs},\n  [genVars]\n);`,
      },
      ["genName", "genInputs", "genVars"]
    )
    const fr = recursiveFold(
      file,
      [template,gendTemplate], // sort by how specific something is... huh
      [],
      { scope: () => `\n` },
      "  ",
      1
    );
    //console.log(stringUnCleaning(tts(fr?.result ?? {})));
    // /console.log(stringUnCleaning(tts(fr?.divisors ?? {})));
    return {...fr.result, ...fr.divisors};
  }
