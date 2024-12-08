import { tts } from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

export function formWordRunFile(wordName: string, template: string): string {
  return `import { ${wordName} } from "./word-pool";\nimport { tts } from "symmetric-parser";\nconst template = ${template};\nconst result = ${wordName}(template);\nconsole.log(tts(result, false));`;
}
