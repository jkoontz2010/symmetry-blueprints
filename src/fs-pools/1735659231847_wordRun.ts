import { getServices } from "./word-pool";
import { tts } from "symmetric-parser";
const template = {};
const result = getServices(template);
console.log(tts(result, false));