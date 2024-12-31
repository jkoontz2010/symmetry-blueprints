import { getUseTemplate } from "./word-pool";
import { tts } from "symmetric-parser";
const template = {};
const result = getUseTemplate(template);
console.log(tts(result, false));