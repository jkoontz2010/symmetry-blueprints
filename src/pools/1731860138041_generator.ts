

import { random,
randomParser } from "./template-pool";
import { tts,
orderedParse, run, 
multiply} from "symmetric-parser";
const template = {
'shop3/would3,test3': ({would3, test3})=>`how ${run(would3, 'would3')} you ${run(test3, 'test3')} this too`,
'shop2/would2,test2': ({would2, test2})=>`how ${run(would2, 'would2')} you ${run(test2, 'test2')} this too`,
'shop1/would1,test1': ({would1, test1})=>`how ${run(would1, 'would1')} you ${run(test1, 'test1')} this too`,
'randomParser1/so1,to1': ({so1, to1})=>`we have ${run(so1, 'so1')} much ${run(to1, 'to1')} parse`,
'to1/asdf2': ({asdf2})=>`${run(asdf2,'asdf2')}`,
'so1/asdf1': ({asdf1})=>`${run(asdf1,'asdf1')}`,
'asdf1': ()=>`asdf`,
'asdf2': ()=>`fdsa`,
'fdsa1': ()=>`fdsa`,
'fdsa2': ()=>`fdasdf`,
'something1': ()=>`some value`,
'something2': ()=>`another one!`
};
// @ts-ignore
const result = orderedParse(multiply(template,{}), [randomParser]);
console.log(tts(result,false));