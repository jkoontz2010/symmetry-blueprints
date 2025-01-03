import { getQueue, clearQueue, ponTesterQueue } from "./word-pool";
import { tts } from "symmetric-parser";
  function run(func: () => string, keyName: string) {
  try {
    if (func == null) {
      return "${run(" + keyName + ", '" + keyName + "')}";
    }
    if (typeof func === "string") {
      throw new Error("func is string");
    }
    const result = func();
    return result;
  } catch (e) {
    return "${run(" + keyName + ", '" + keyName + "')}";
  }
}
  
const template = {
'useTemplate.ts60c890fb5b/fileContents1': ({fileContents1})=>`${run(fileContents1, 'fileContents1')}`,
'fileContents1': ()=>`
import { cloneDeep, compact, difference, last, uniqueId } from "lodash";
import { useEffect, useState } from "react";
import {
  appendKeyToKey,
  dumbCombine,
  insertIntoTemplate,
  sortTemplateByDeps,
  tts,
  argsAndTemplateToFunction,
} from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";
import { formGeneratorFile } from "./hgcgUtil";
import { CONFIG_PATH } from "../components/App";
import { customAlphabet } from "nanoid";
import { WordDefinition } from "../components/TemplateTree";
import { pathToFileURL } from "url";

export type WordStep = {
  name?: string;
  args?: any[];
  result: Template;
  full?: string;
  files?: { generatorFilePath?: string; resultFilePath?: string };
};

export function useTemplate(
  definition: WordDefinition,
  templateModule: any,
  generatorModule: any,
  wordModule: any,
  postMessage: any,
  isMainTemplate: boolean
) {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 4);

  const [msgId, setMsgId] = useState(nanoid());
  let [template, setTemplate] = useState<Template>(
    last(definition.wordSteps).result
  );

  useEffect(() => {
    setTemplate(last(definition.wordSteps).result);
  },[definition])

  const [wordSteps, setWordSteps] = useState<WordStep[]>(definition.wordSteps);
  function logStep(name, args, result, files = {}) {
    const wordStep = {
      name: name,
      args: args,
      full: ェ§{name}(§{args.join(",")})ェ,
      result: cloneDeep(result),
      files,
    };

    const newWordSteps = [...wordSteps, wordStep];
    setWordSteps(newWordSteps);
    const stringifiedSteps = newWordSteps.map((ws) => {
      return {
        name: ws.name,
        args: ws.args,
        full: ws.full,
        result:
          typeof ws.result === "string" ? ws.result : tts(ws.result, false),
        files: ws.files,
      };
    });
    const wordName = definition.name;

    postMessage({
      command: "save_word_steps",
      wordSteps: JSON.stringify(stringifiedSteps),
      wordName,
      msgId,
    });
  }

  function removeKey(key: string) {
    const newTemplate = cloneDeep(template);
    delete newTemplate[key];
    logStep("deleteKey", [key], newTemplate);
    setTemplate(newTemplate);
  }
  function addKey(key: string) {
    const templateHasNumerator = Object.keys(template).some((k) => {
      return k.split("/")[0] === key;
    });
    if (templateHasNumerator) return;
    let combineWith = { [key]: () => ェェ };
    let newTemplate = dumbCombine(template, combineWith);
    let result = sortTemplateByDeps(sortTemplateByDeps(newTemplate));
    logStep("dumbCombine", [template, combineWith], result);
    setTemplate(result);
  }

  function addKeyToNumerator(appendKey: string, toKey: string) {
    const fullToKey = Object.keys(template).find(
      (k) => k.split("/")[0] === toKey
    );
    if (fullToKey != null) {
      // check that the appendKey isn't already in there
      const denoms = fullToKey.split("/")[1]?.split(",");
      if (denoms?.includes(appendKey)) {
        return;
      }
    }
    let newTemplate = appendKeyToKey(template, appendKey, toKey);
    let result = sortTemplateByDeps(sortTemplateByDeps(newTemplate));
    logStep("appendKeyToKey", [template, appendKey, toKey], result);

    setTemplate(result);
  }

  function insertTemplateIntoTemplate(templateToInsert: Template) {
    console.log("inserting template into template", templateToInsert);
    let newTemplate = insertIntoTemplate(template, templateToInsert);
    let result = sortTemplateByDeps(sortTemplateByDeps(newTemplate));
    logStep("insertIntoTemplate", [template, templateToInsert], result);

    setTemplate(result);
  }
  function insertTemplateIntoTemplateAtKey(
    templateToInsert: Template,
    toKey: string
  ) {
    console.log(
      "insertTemplateIntoTemplateAtKey",
      templateToInsert,
      toKey,
      template
    );
    const oldKeys = Object.keys(template);
    let newTemplate = insertIntoTemplate(template, templateToInsert);
    logStep("insertIntoTemplate", [template, templateToInsert], newTemplate);

    const newKeys = Object.keys(newTemplate);
    const newestKey = newKeys
      .filter((k) => !oldKeys.includes(k))[0]
      ?.split("/")[0];
    //console.log("NEWEST KEY", newestKey);
    let appendedTemplate = appendKeyToKey(newTemplate, newestKey, toKey);
    const result = sortTemplateByDeps(sortTemplateByDeps(appendedTemplate));
    logStep("appendKeyToKey", [newTemplate, newestKey, toKey], result);
    setTemplate(result);
  }

  const handleGeneratorResult = (message: any) => {
    //console.log("WORD STEPS ON MESSAGE", wordSteps);

    //console.log("MESSAGE DATA", message.data);
    const { generatorFilePath, resultFilePath, result, generatorString } =
      message.data;
    //console.log("generator_result", result);
    const name = generatorString.substring(0, generatorString.indexOf("("));

    const args = generatorString
      .substring(generatorString.indexOf("(") + 1, generatorString.indexOf(")"))
      .split(",");

    logStep(name, args, result, {
      generatorFilePath,
      resultFilePath,
    });
    setTemplate(new Function("return " + result)());
  };

  const handleWordRunResult = (message:any) => {
    const { wordRunFilePath, resultFilePath, result, wordString } =
      message.data;
    console.log("word_run_result", result);
    const name = wordString.substring(0, wordString.indexOf("("));

    const args = ["template"]

    logStep(name, args, result, {
      wordRunFilePath,
      resultFilePath,
    });
    setTemplate(new Function("return " + result)());
  }

  function handleGenericMessage(event: MessageEvent) {
    const message = event.data; // The json data that the extension sent
    switch (message.command) {
      case "file_insert": {
        if (isMainTemplate) {
          const { contents, filePath } = message.data;
          const funcPart = argsAndTemplateToFunction([], contents);
          const templ = { [filePath]: funcPart };
          //console.log("FILE INSERT", contents, filePath, templ);
          insertTemplateIntoTemplate(templ);
        }
        break;
      } 
      default:
        break;
    }
  }
  useEffect(() => {
    window.addEventListener("message", handleGenericMessage);
    return () => {
      window.removeEventListener("message", handleGenericMessage);
    };
  }, [isMainTemplate]);
  function handleMessage(event: MessageEvent) {
    if (event.data.data.msgId !== msgId) return;
    const message = event.data; // The json data that the extension sent
    switch (message.command) {
      case "generator_result":
        console.log("handling generator result")
        handleGeneratorResult(message);
        break;
      case "word_run_result": {
        console.log("handling word run result")
        handleWordRunResult(message);
        break;
      }
      default: {
        // defaults give a good end-of-switch-statement parse hack
        break;
      }
    }
  }
  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [wordSteps]);
  function applyGeneratorString(generatorString: string) {
    // form it and send it over

    // send it over via postMessage
    postMessage({
      command: "run_generator",
      generatorString,
      template: tts(template,false),
      msgId,
    });
  }
  const handleConvertWordSteps = () => {
    const parsedWord=parseWordStepsIntoWord(definition.name, wordSteps)
    console.log("parsedWord", parsedWord, wordSteps);
    postMessage({
      command: "store_runnable_word",
      word: parsedWord,
    })
  }
  const handleRunnableWordClick = (rWordName:string) => {
    // postMessage
    // run word
    // get result back

    postMessage({
      command: "run_word",
      wordName:rWordName,
      template: tts(template,false),
      msgId,
    })
  }
  const handleTransition = () => {
    postMessage({
      command: "transition",
      template: tts(template,false),
    })
  }
  console.log("Word steps", wordSteps);
  return {
    template,
    addKey,
    addKeyToNumerator,
    insertTemplateIntoTemplate,
    insertTemplateIntoTemplateAtKey,
    wordSteps,
    applyGeneratorString,
    removeKey,
    handleConvertWordSteps,
    handleRunnableWordClick,
    handleTransition
  };
}

function parseWordStepsIntoWord(wordName:string, wordSteps: WordStep[]): string {
	const callbacks = compact(wordSteps.map(step=> {
		if(step.name==="insertIntoTemplate") {
			return null
		}
    if(step.full==null) {return null}
		return ェ(template)=>§{step.full}ェ
	}))

	const word = ェexport const §{wordName} = flow(§{callbacks.join(",")})ェ
  return word;
}`
};
const result = ponTesterQueue(template);
const queue=getQueue();
console.log(tts(result, false));
if(queue.length>0) {
console.log("|||||||");
queue.forEach(q=>console.log(tts(q,false),"&&&&&&&"))}
clearQueue();