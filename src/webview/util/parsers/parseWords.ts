import {
    genTemplateWithVars, recursiveFold
} from "symmetric-parser";


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
  return { ...of.result, ...of.divisors };
}


