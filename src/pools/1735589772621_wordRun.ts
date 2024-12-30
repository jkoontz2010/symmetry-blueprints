import { ponTester2 } from "./word-pool";
import { tts } from "symmetric-parser";
const template = {filePath1:()=>`src/panel.ts`};
const result = ponTester2(template);
console.log(tts(result, false));