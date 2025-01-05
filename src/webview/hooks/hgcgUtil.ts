import { tts } from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

export function formGeneratorFile(
  generatorString: string,
  template: Template,
  templateModule: any,
  generatorModule: any
): string {
  console.log("formGeneratorFile", templateModule)
  // future, check if Object.keys etc includes words foundin generatorRun
  const templates = Object.keys(templateModule).filter(
    (k) => generatorString.indexOf(k) > -1
  );
  const generators = Object.keys(generatorModule).filter(
    (k) => generatorString.indexOf(k) > -1
  );
  const generalImports = `import { getQueue, clearQueue } from "./word-pool"
  import { ${templates.join(
    ",\n"
  )} } from "./template-pool";`;
  const generatorsImport = `import { tts,\nrun,\n${generators.join(
    ",\n"
  )} } from "symmetric-parser";`;
  const templateString = `const template = ${tts(template, false)};`;
  const generatorRun = `// @ts-ignore\nconst result = ${generatorString};\nconsole.log(tts(result,false));`;
  return `${generalImports}\n${generatorsImport}\n${templateString}\n${generatorRun}`;
}
