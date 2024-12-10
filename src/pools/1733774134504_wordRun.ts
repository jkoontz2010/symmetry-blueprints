import { fullTest } from "./word-pool";
import { tts } from "symmetric-parser";
const template = {

};
const result = fullTest(template);
console.log(tts(result, false));