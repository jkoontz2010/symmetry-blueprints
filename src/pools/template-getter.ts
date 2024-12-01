import { tts } from '../../../react-for-code/dist/src/templator/utility';
import * as templates from './template-pool';


const result: Record<string,string> = Object.keys(templates).reduce((acc, key) => {
    const template = tts(templates[key]);
    return {
        ...acc,
        [key]: template
    }
},{})
console.log(JSON.stringify(result));