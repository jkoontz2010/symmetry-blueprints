import { getQueue, clearQueue } from "./word-pool";
import { commandSend,
panelCommand } from "./template-pool";

import {  tts,
run,
performOnLinkedBySections } from "symmetric-parser";


const template = {
'.DSe7e2950e98/fileContents39': ({fileContents39})=>`${run(fileContents39, 'fileContents39')}`,
'compiler.tsc3618913d2/fileContents38': ({fileContents38})=>`${run(fileContents38, 'fileContents38')}`,
'extension.tsec46bfbfac/fileContents37': ({fileContents37})=>`${run(fileContents37, 'fileContents37')}`,
'getNonce.ts47b72c4626/fileContents36': ({fileContents36})=>`${run(fileContents36, 'fileContents36')}`,
'index.tsxec7ce083ed/fileContents35': ({fileContents35})=>`${run(fileContents35, 'fileContents35')}`,
'createWordFromJson.ts895f3edd7a/fileContents34': ({fileContents34})=>`${run(fileContents34, 'fileContents34')}`,
'parseGenerators.tsa908b43054/fileContents33': ({fileContents33})=>`${run(fileContents33, 'fileContents33')}`,
'runner.ts09798de81d/fileContents32': ({fileContents32})=>`${run(fileContents32, 'fileContents32')}`,
'.DSfa3f423110/fileContents31': ({fileContents31})=>`${run(fileContents31, 'fileContents31')}`,
'App.tsxe233888b2d/fileContents30': ({fileContents30})=>`${run(fileContents30, 'fileContents30')}`,
'BuilderAccordion.tsxf6c47abb17/fileContents29': ({fileContents29})=>`${run(fileContents29, 'fileContents29')}`,
'Dropdown.tsx30dab73e04/fileContents28': ({fileContents28})=>`${run(fileContents28, 'fileContents28')}`,
'DynamicForm.tsxdf152500d9/fileContents27': ({fileContents27})=>`${run(fileContents27, 'fileContents27')}`,
'DynamicFormOld3.tsx0cf8ec536f/fileContents26': ({fileContents26})=>`${run(fileContents26, 'fileContents26')}`,
'GTWVEditor.tsxf2771a3915/fileContents25': ({fileContents25})=>`${run(fileContents25, 'fileContents25')}`,
'Item.tsxc641ad44fb/fileContents24': ({fileContents24})=>`${run(fileContents24, 'fileContents24')}`,
'QueueHeader.tsx6dd24430ee/fileContents23': ({fileContents23})=>`${run(fileContents23, 'fileContents23')}`,
'SortableItem.tsx3cad9f1f40/fileContents22': ({fileContents22})=>`${run(fileContents22, 'fileContents22')}`,
'TemplateTree.tsx0524a0d899/fileContents21': ({fileContents21})=>`${run(fileContents21, 'fileContents21')}`,
'WordBuilderForm.tsxec964c89ec/fileContents20': ({fileContents20})=>`${run(fileContents20, 'fileContents20')}`,
'WordCreator.tsx4102c005c8/fileContents19': ({fileContents19})=>`${run(fileContents19, 'fileContents19')}`,
'v2.tsx715fc7afef/fileContents18': ({fileContents18})=>`${run(fileContents18, 'fileContents18')}`,
'hgcgUtil.ts791df9ac7f/fileContents17': ({fileContents17})=>`${run(fileContents17, 'fileContents17')}`,
'useFileSystem.ts4f87732c11/fileContents16': ({fileContents16})=>`${run(fileContents16, 'fileContents16')}`,
'fileContents16/commandSend08,commandSend09,commandSend010,commandSend011,commandSend012,commandSend013': ({commandSend08, commandSend09, commandSend010, commandSend011, commandSend012, commandSend013})=>`
import React from "react";
import { WordStep } from "./useTemplate";
import { tts } from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

function parseStringifiedTemplateModule(templateModule: string) {
  const templModuleFirstParse = new Function("return " + templateModule)();
  const templModule = Object.keys(templModuleFirstParse).reduce((acc, key) => {
    const templified = new Function("return " + templModuleFirstParse[key])();
    acc[key] = templified;
    return acc;
  }, {});
  return templModule;
}

export function useFileSystem(postMessage) {
  const [all, setAll] = React.useState<any>({
    generatorsFileText: null,
    templatesFileText: null,
    filledGeneratorsFileText: null,
    currentWord: null,
    wordNames: [],
    currentWordName: null,
    templateModule: null,
    allFileTemplates: null,
    runnableWords: null,
    queueNames: [],
    subTemplate: null
  });
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    window.addEventListener("message", (event) => {
      const message = event.data; // The json data that the extension sent
      switch (message.command) {
        case "config_data": {
          const {
            generators,
            templates,
            filledGenerators,
            currentWord,
            wordNames,
            currentWordName,
            templateModule,
            fileTemplates,
            runnableWords,
            queueNames,
            subTemplate,
          }: {
            generators: string;
            templates: string;
            filledGenerators: string;
            currentWord: string;
            wordNames: string;
            currentWordName: string;
            templateModule: string;
            fileTemplates: string;
            runnableWords: string;
            queueNames: string;
            subTemplate: string;
          } = message.data;
          const rw = JSON.parse(runnableWords);
          console.log("GIBING US TROUBLE", JSON.parse(currentWord))
          const parsedCurrentWord = JSON.parse(currentWord).map((cw) => ({
            ...cw,
            result: new Function("return " + cw.result)(),
          }));
          const parsedAllFileTemplate = new Function(
            "return " + fileTemplates
          )();
          const parsedSubTemplate =
            subTemplate == null
              ? null
              : new Function("return " + subTemplate)();
          const templModule = parseStringifiedTemplateModule(templateModule);
          const parsedWordNames = JSON.parse(wordNames);
          const parsedQueueNames = JSON.parse(queueNames);

          const all ={
            generatorsFileText: generators,
            templatesFileText: templates,
            filledGeneratorsFileText: filledGenerators,
            currentWord: parsedCurrentWord,
            wordNames: parsedWordNames,
            currentWordName: currentWordName,
            templateModule: templModule,
            allFileTemplates: parsedAllFileTemplate,
            runnableWords: rw,
            queueNames: parsedQueueNames,
            subTemplate: parsedSubTemplate,
          };
          setAll(all);
          setLoading(false);
          break;
        }
        case "word_contents": {
          const { wordName, wordContents } = message.data;
          console.log("WORD CONTENTS", message);
          //setCurrentWordName(wordName);
          let parsedCurrentWord;
          if (wordContents === "[]") {
            parsedCurrentWord = [{ result: {} }];
          } else {
            parsedCurrentWord = JSON.parse(wordContents).map((cw) => ({
              ...cw,
              result: new Function("return " + cw.result)(),
            }));
          }
          //setCurrentWord(parsedCurrentWord);
          let newWordNames = all.wordNames;
          if (!all.wordNames.includes(wordName)) {
            newWordNames=[...all.wordNames, wordName];
          }
          setAll((prev) => ({ ...prev, wordNames: newWordNames, currentWord:parsedCurrentWord, currentWordName:wordName }));
          setLoading(false);
          break;
        }
        case "all_templates": {
          const { templateModule } = message.data;
          const templModule = parseStringifiedTemplateModule(templateModule);
          setAll((prev) => ({ ...prev, templateModule: templModule }));
          break;
        }
        case "all_file_templates": {
          const { fileTemplates } = message.data;

          setAll((prev) => ({ ...prev, allFileTemplates: new Function("return " + fileTemplates)() }));
          break;
        }
        case "all_runnable_words": {
          const { runnableWords } = message.data;
          const rw = JSON.parse(runnableWords);
          setAll((prev) => ({ ...prev, runnableWords: rw }));
        }
      }
    });
  }, []);
  const readAllFiles = (queueName: string) => {
   ${run(commandSend08, 'commandSend08')}
  };
  const writeFile = (path, data) => {
   ${run(commandSend09, 'commandSend09')}
  };
  const setWord = (name) => {
   ${run(commandSend010, 'commandSend010')}

    setLoading(true);
  };
  const createNewWord = (name) => {
    // word_contents received in response
   ${run(commandSend011, 'commandSend011')}
    setLoading(true);
  };
  const addToTemplatePool = (key: string, value: string, args: string[]) => {
    console.log("SENDING TO ADD TO TEMPLATE POOL", key, value, args);
   ${run(commandSend012, 'commandSend012')}
  };
  const selectQueue = (queueName) => {
   ${run(commandSend013, 'commandSend013')}
  };

  return {
    readAllFiles,
    createNewWord,
    writeFile,
    setWord,
    addToTemplatePool,
    selectQueue,
    loading,
    ...all,
  };
}
`,
'commandSend08/commandBody08': ({commandBody08})=>` postMessage({${run(commandBody08, 'commandBody08')}});`,
'commandBody08/nameProperty06': ({nameProperty06})=>` ${run(nameProperty06, 'nameProperty06')} queueName `,
'nameProperty06/commandName06': ({commandName06})=>`command: "${run(commandName06, 'commandName06')}",`,
'commandSend09/commandBody09': ({commandBody09})=>` postMessage({${run(commandBody09, 'commandBody09')}});`,
'commandBody09/nameProperty05': ({nameProperty05})=>` ${run(nameProperty05, 'nameProperty05')} path, data `,
'nameProperty05/commandName05': ({commandName05})=>`command: "${run(commandName05, 'commandName05')}",`,
'commandSend010/commandBody010': ({commandBody010})=>` postMessage({${run(commandBody010, 'commandBody010')}});`,
'commandBody010/nameProperty04': ({nameProperty04})=>`
      ${run(nameProperty04, 'nameProperty04')}
      wordName: name,
    `,
'nameProperty04/commandName04': ({commandName04})=>`command: "${run(commandName04, 'commandName04')}",`,
'commandSend011/commandBody011': ({commandBody011})=>` postMessage({${run(commandBody011, 'commandBody011')}});`,
'commandBody011/nameProperty03': ({nameProperty03})=>`
      ${run(nameProperty03, 'nameProperty03')}
      wordName: name,
    `,
'nameProperty03/commandName03': ({commandName03})=>`command: "${run(commandName03, 'commandName03')}",`,
'commandSend012/commandBody012': ({commandBody012})=>` postMessage({${run(commandBody012, 'commandBody012')}});`,
'commandBody012/nameProperty02': ({nameProperty02})=>`
      ${run(nameProperty02, 'nameProperty02')}
      key,
      args: JSON.stringify(args),
      value,
    `,
'nameProperty02/commandName02': ({commandName02})=>`command: "${run(commandName02, 'commandName02')}",`,
'commandSend013/commandBody013': ({commandBody013})=>` postMessage({${run(commandBody013, 'commandBody013')}});`,
'commandBody013/nameProperty01': ({nameProperty01})=>`
      ${run(nameProperty01, 'nameProperty01')}
      queueName,
    `,
'nameProperty01/commandName01': ({commandName01})=>`command: "${run(commandName01, 'commandName01')}",`,
'useHotkeys.ts3ae905fc81/fileContents15': ({fileContents15})=>`${run(fileContents15, 'fileContents15')}`,
'useMeta.tsaa5e4c5ba3/fileContents14': ({fileContents14})=>`${run(fileContents14, 'fileContents14')}`,
'useQueueListener.ts0a03de5ffe/fileContents13': ({fileContents13})=>`${run(fileContents13, 'fileContents13')}`,
'fileContents13/hookCmdHandler03': ({hookCmdHandler03})=>`
import { useEffect, useState } from "react";
import { DequeueStep } from "../../runner/runner";
type QueueStepData = {
  type: string;
  name: string;
  description: string;
  word: string;
  isWaitingForCommand: boolean;
  transitionAction: string;
}
const FAKE_DATA = [
  {
      "type": "template",
      "name": "parseFifth_subTemplate",
      "description": "Queue item from subTemplate",
      "word": "-",
      "isWaitingForCommand": true,
      "transitionAction": "identity"
  },
  {
      "type": "template",
      "name": "parseFifth",
      "description": "runs the word that parses fifth.tsx",
      "word": "-",
      "isWaitingForCommand": false,
      "transitionAction": "identity"
  }
]
export function useQueueListener() {
  const [queueSteps, setQueueSteps] = useState<QueueStepData[]>(FAKE_DATA);
  function handleQueueUpdate(message) {
    const newQueueSteps = message.data;

  }
  function handleMessage(event: MessageEvent) {
    const message = event.data; // The json data that the extension sent
    ${run(hookCmdHandler03, 'hookCmdHandler03')} {
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
  }, []);

  return {
    queueSteps,
  }
}
`,
'hookCmdHandler03/hookCommandHandlerBody03': ({hookCommandHandlerBody03})=>`switch (message.command)${run(hookCommandHandlerBody03,'hookCommandHandlerBody03')}default:`,
'hookCommandHandlerBody03/hookCmdHandleSection01': ({hookCmdHandleSection01})=>` {
      ${run(hookCmdHandleSection01, 'hookCmdHandleSection01')}
      `,
'hookCmdHandleSection01/hookHandlerName01,hookHandlerBody01': ({hookHandlerName01, hookHandlerBody01})=>`case "${run(hookHandlerName01,'hookHandlerName01')}":${run(hookHandlerBody01,'hookHandlerBody01')}break;`,
'useRunner.ts2d1ba9b42e/fileContents12': ({fileContents12})=>`${run(fileContents12, 'fileContents12')}`,
'fileContents12/commandSend04,commandSend05,commandSend06,commandSend07': ({commandSend04, commandSend05, commandSend06, commandSend07})=>`
import { customAlphabet } from "nanoid";
import React, { useEffect, useState } from "react";
import {
  genTemplateWithVars,
  tts,
  argsAndTemplateToFunction,
} from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

export function useRunner(
  postMessage: any,
  configPath: string,
  filledGeneratorsFileText: string
) {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 4);
  //console.log("TEST??",filledGeneratorsFileText)
  const [msgId, setMsgId] = useState(nanoid());
  const [generatorModule, setGeneratorModule] = React.useState<any>({});
  const [templateModule, setTemplateModule] = React.useState<any>(null);
  const [wordModule, setWordModule] = React.useState<any>(null);
  const [filledGenerators, setFilledGenerators] = React.useState<Template>(
    new Function("return " + filledGeneratorsFileText)()
  );
  //console.log("FILLED GENERATORs", filledGenerators)
  useEffect(() => {
    setFilledGenerators(new Function("return " + filledGeneratorsFileText)());
  }, [filledGeneratorsFileText]);
  const fetchGenerators = async () => {
    const data = await import("../../pools/utility-templates");
    setGeneratorModule(data);
  };
  const fetchTemplates = async () => {
    const data = await import("../../pools/template-pool");
    //console.log("AFTER IMPORT", data);
    // @ts-ignore
    //console.log("GOOD LUCK", data);
    setTemplateModule(data);
  };

  useEffect(() => {
    fetchGenerators();
    fetchTemplates();
  }, []);

  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.data.data.msgId !== msgId) return;
      const message = event.data; // The json data that the extension sent
      switch (message.command) {
        case "all_filled_generators": {
          //console.log("all_filled_generators", message.data);
          const { allFilledGenerators } = message.data;
          setFilledGenerators(new Function("return " + allFilledGenerators)());
          //console.log("NEW ALL FILELD",new Function("return " + allFilledGenerators)())
          break;
        }
      }
    });
  }, []);

  const addFullTemplateToPool = (name: string, template: Template) => {
    if (templateModule[name] != null) {
      throw new Error("Template with this name already exists");
    }
  ${run(commandSend04, 'commandSend04')}
   ${run(commandSend05, 'commandSend05')}
  };

  const addToFilledGeneratorPool = (filledGenerator: Template) => {
    if (Object.keys(filledGenerator).length !== 1) {
      throw new Error("Filled generator must have exactly one key");
    } else {
     ${run(commandSend06, 'commandSend06')}
    }
  };

  const handleSaveAllFiles = (template: Template) => {
   ${run(commandSend07, 'commandSend07')}
  };

  //console.log("here we are", generatorModule, templateModule, wordModule);

  return {
    templateModule,
    handleSaveAllFiles,
    generatorModule,
    wordModule,
    filledGenerators,
    addToTemplatePool,
    addToFilledGeneratorPool,
    addFullTemplateToPool
  };
}
`,
'commandSend04/commandBody04': ({commandBody04})=>` postMessage({${run(commandBody04, 'commandBody04')}});`,
'commandBody04/nameProperty10': ({nameProperty10})=>`
    ${run(nameProperty10, 'nameProperty10')}
    name,
    template: tts(template, false),
    pathToConfig: configPath,
   })
  }

  const addToTemplatePool = (key: string, value: string, args: string[]) => {
    const funcPart = argsAndTemplateToFunction([], value);
    const templ = { [key]: funcPart };
    const template = genTemplateWithVars(templ, args);
    //console.log("addToTemplatePool", template);
    if (templateModule[key] != null) {
      throw new Error("Template with this name already exists");
    }
    setTemplateModule((prev) => {
      return {
        ...prev,
        ...{ [key]: template },
      };
    `,
'nameProperty10/commandName10': ({commandName10})=>`command: "${run(commandName10, 'commandName10')}",`,
'commandSend05/commandBody05': ({commandBody05})=>` postMessage({${run(commandBody05, 'commandBody05')}});`,
'commandBody05/nameProperty09': ({nameProperty09})=>`
      ${run(nameProperty09, 'nameProperty09')}
      key,
      args: JSON.stringify(args),
      value,
      pathToConfig: configPath,
    `,
'nameProperty09/commandName09': ({commandName09})=>`command: "${run(commandName09, 'commandName09')}",`,
'commandSend06/commandBody06': ({commandBody06})=>` postMessage({${run(commandBody06, 'commandBody06')}});`,
'commandBody06/nameProperty08': ({nameProperty08})=>`
        ${run(nameProperty08, 'nameProperty08')}
        pathToConfig: configPath,
        filledGenerator: tts(filledGenerator, false),
        msgId,
      `,
'nameProperty08/commandName08': ({commandName08})=>`command: "${run(commandName08, 'commandName08')}",`,
'commandSend07/commandBody07': ({commandBody07})=>` postMessage({${run(commandBody07, 'commandBody07')}});`,
'commandBody07/nameProperty07': ({nameProperty07})=>`
      ${run(nameProperty07, 'nameProperty07')}
      pathToConfig: configPath,
      template: tts(template),
    `,
'nameProperty07/commandName07': ({commandName07})=>`command: "${run(commandName07, 'commandName07')}",`,
'useWordBuilder.ts50447cadc3/fileContents11': ({fileContents11})=>`${run(fileContents11, 'fileContents11')}`,
'fileContents11/commandSend03': ({commandSend03})=>`
import { customAlphabet } from "nanoid";
import { useState } from "react";
import { genTemplateWithVars } from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

import { cloneDeep } from "lodash";
import { setKeyValue } from "./util";
import {
  buildWordBodyFromSteps,
  buildWordFromNameAndBody,
} from "../util/parsers/createWordFromJson";

export type BuilderWord = {
  name: string;
  steps: BuilderGenerator[];
};
export type BuilderTemplate = {
  name: string;
  templateBody: string; // the body of the template
  vars: string[]; // the variables in the template
};

export type Schema = Record<string, any>;

export type BuilderGenerator = {
  name: string;
  inputs?: Record<string, any>;
  inputSchema: Schema;
  outputName?: string;
};

export type BuilderNewWord = {
  wordName: string;
  steps: BuilderGenerator[];
};

export enum Types {
  Template = "Template",
  TemplateArray = "TemplateArray",
  String = "String",
  StringArray = "StringArray",
  Number = "Number",
  Object = "Object", // recurse on this
  Function = "Function",
  ArrayOfObjects = "ArrayOfObjects", // recurse on this*/
}
const firsty: Template = {
  firsty: () => ェthis is where we do itェ,
};
const secondy: Template = {
  secondy: () => ェthat is the second timeェ,
};

const thirdy: Template = {
  thirdy: () => ェthis is the third timeェ,
};
const fourthy: Template = {
  fourthy: () => ェthis is the fourth timeェ,
};
const fifthy: Template = {
  fifthy: () => ェthis is the fifth timeェ,
};
const sixthy: Template = genTemplateWithVars(
  { sixthy: () => "I hope this works" },
  ["hope"]
);

function buildInputsFromSchema(schema: Schema) {
  const inputs: Record<string, any> = {};
  Object.entries(schema).forEach(([key, type]) => {
    if (type === Types.Template) {
      inputs[key] = null;
    } else if (type === Types.TemplateArray) {
      inputs[key] = [];
    } else if (type === Types.String) {
      inputs[key] = "";
    }
  });
  return inputs;
}

const identityGenerator: BuilderGenerator = {
  name: "identity",
  inputSchema: { template: Types.Template },
  inputs: { template: null },
};

const combineAllGenerator: BuilderGenerator = {
  name: "combineAll",
  inputSchema: { templates: Types.TemplateArray },
};

const combineGenerator = {
  name: "combine",
  generator: (template1: Template, template2: Template) => ({
    ...template1,
    ...template2,
  }),
  inputSchema: {
    template1: Types.Template,
    template2: Types.Template,
  },
  inputs: { template1: null, template2: null },
};
export function useWordBuilder({
  wordsMeta,
  templatesMeta,
  generatorsMeta,
  postMessage,
}: {
  wordsMeta: BuilderWord[];
  templatesMeta: BuilderTemplate[];
  generatorsMeta: BuilderGenerator[];
  postMessage: any;
}) {
  const [newWord, setNewWord] = useState<BuilderNewWord>({
    wordName: "new", // handled by form now, sorry for the tech debt!
    steps: [],
  });
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  function addStepToWord(step: any, position: number) {
    // if step doesn't have an output, we create one.
    // this should be specified by the generator...

    const alphabet =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const nanoid = customAlphabet(alphabet, 4);
    const stepOutputId = nanoid();

    const newStep = {
      ...step,
      outputName: step.name + "_" + stepOutputId,
      ...buildInputsFromSchema(step.inputSchema),
    };

    setNewWord((prev) => {
      const newSteps = [...prev.steps];
      newSteps.splice(position, 0, newStep);
      const stepsWithInput = setAllStepInputsToPriorStepOutput(newSteps);
      console.log("NEW STEPS", stepsWithInput);
      return { ...prev, steps: stepsWithInput };
    });
  }

  function submitWord(formSubmission: any) {
    console.log("SUBMITTING", formSubmission);
    // grab steps
    // update the values at each step
    const newSteps = newWord.steps.map((step) => {
      const stepOutputName = step.outputName;
      const formStep = formSubmission[stepOutputName];
      // put step values from formStep into step
      return { ...step, inputValues: formStep };
    });

    console.log("NEW WORD", JSON.stringify(newSteps, null, 2));

    const parsedSteps = buildWordBodyFromSteps(
      JSON.stringify(newSteps, null, 2)
    );
    const fullWord = buildWordFromNameAndBody(
      formSubmission.wordName,
      parsedSteps
    );
    // TODO: MAKE CONFIGURABLE

    console.log("PARSED STEPS", fullWord);
   ${run(commandSend03, 'commandSend03')}
    console.log("POSTED MESSAGE");
  }

  function setAllStepInputsToPriorStepOutput(steps) {
    return steps.map((step, idx) => {
      const priorStepOutput = steps[idx - 1]?.outputName ?? "wordInput";
      const inputSchema = cloneDeep(step.inputSchema);
      delete step.inputSchema;
      const newStep = setKeyValue("input", priorStepOutput, step);
      newStep.inputSchema = inputSchema;
      return newStep;
    });
  }

  function removeStepFromWord(position: number) {
    // go thru all steps. if any step uses output from
    // the deleted step, remove that output!
    const { steps } = newWord;
    const removedStep = steps[position];
    const removedOutput = removedStep.outputName;
    const newSteps = steps.filter((step) => {
      console.log("FULL STEP", step);
      if (step.inputs == null) return true;
      const inputs = Object.values(step?.inputs);
      console.log(
        "LOOKING AT",
        inputs,
        removedOutput,
        "FROM STEP",
        step.inputs
      );
      return !inputs.includes(removedOutput);
    });
    setNewWord((prev) => {
      newSteps.splice(position, 1);
      return { ...prev, steps: newSteps };
    });
  }

  function updateStepPosition(from: number, to: number) {
    setNewWord((prev) => {
      const newSteps = [...prev.steps];
      const [removed] = newSteps.splice(from, 1);
      newSteps.splice(to, 0, removed);
      return { ...prev, steps: newSteps };
    });
  }

  function runWord(name: string, input: Template = {}) {
    const outputs: Template[] = [];
    function registerOutput(output: Template) {
      outputs.push(output);
    }
    /*
    const word = words.find((w: BuilderWord) => w.name === name);
    // run the word raw. if any errors occur, let TypeScript return them, and we'll display.
    // we'll need to load it into typescript dynamically, which is very V2.
    try {
      word(input, registerOutput);
    } catch (e) {
      console.error(e);
      setRuntimeError(e.message);
    }
      */
  }

  return {
    newWord,
    runtimeError,
    addStepToWord,
    updateStepPosition,
    runWord,
    removeStepFromWord,
    submitWord,
  };
}
`,
'commandSend03/commandBody03': ({commandBody03})=>` postMessage({${run(commandBody03, 'commandBody03')}});`,
'commandBody03/nameProperty11': ({nameProperty11})=>`
      ${run(nameProperty11, 'nameProperty11')}
      word: fullWord.fullWord(),
      pathToConfig:
        "/Users/jaykoontz/Documents/GitHub/symmetric-blueprints/.spconfig",
    `,
'nameProperty11/commandName11': ({commandName11})=>`command: "${run(commandName11, 'commandName11')}",`,
'util.ts2d61ca9574/fileContents10': ({fileContents10})=>`${run(fileContents10, 'fileContents10')}`,
'parseTemplates.tsbf975773bc/fileContents9': ({fileContents9})=>`${run(fileContents9, 'fileContents9')}`,
'hotKeyBuilder.ts6daa92dc78/fileContents8': ({fileContents8})=>`${run(fileContents8, 'fileContents8')}`,
'parseWords.ts0da51f25b2/fileContents7': ({fileContents7})=>`${run(fileContents7, 'fileContents7')}`,
'commandService.ts69cdb52686/fileContents6': ({fileContents6})=>`${run(fileContents6, 'fileContents6')}`,
'configService.ts0198e0307e/fileContents5': ({fileContents5})=>`${run(fileContents5, 'fileContents5')}`,
'fsService.tse294b67673/fileContents4': ({fileContents4})=>`${run(fileContents4, 'fileContents4')}`,
'wordRunService.tsaa3e96021c/fileContents3': ({fileContents3})=>`${run(fileContents3, 'fileContents3')}`,
'useTemplate.ts60c890fb5b/fileContents2': ({fileContents2})=>`${run(fileContents2, 'fileContents2')}`,
'fileContents2/commandSend01,hookCmdHandler01,hookCmdHandler02,commandSend02': ({commandSend01, hookCmdHandler01, hookCmdHandler02, commandSend02})=>`
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

   ${run(commandSend01, 'commandSend01')}
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
    ${run(hookCmdHandler01, 'hookCmdHandler01')}
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
    ${run(hookCmdHandler02, 'hookCmdHandler02')} {
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
   ${run(commandSend02, 'commandSend02')}
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
  //console.log("Word steps", wordSteps);
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
}`,
'commandSend01/commandBody01': ({commandBody01})=>` postMessage({${run(commandBody01, 'commandBody01')}});`,
'commandBody01/nameProperty13': ({nameProperty13})=>`
      ${run(nameProperty13, 'nameProperty13')}
      wordSteps: JSON.stringify(stringifiedSteps),
      wordName,
      msgId,
    `,
'nameProperty13/commandName13': ({commandName13})=>`command: "${run(commandName13, 'commandName13')}",`,
'commandSend02/commandBody02': ({commandBody02})=>` postMessage({${run(commandBody02, 'commandBody02')}});`,
'commandBody02/nameProperty12': ({nameProperty12})=>`
      ${run(nameProperty12, 'nameProperty12')}
      generatorString,
      template: tts(template,false),
      msgId,
    `,
'nameProperty12/commandName12': ({commandName12})=>`command: "${run(commandName12, 'commandName12')}",`,
'hookCmdHandler01/hookCommandHandlerBody01': ({hookCommandHandlerBody01})=>`switch (message.command)${run(hookCommandHandlerBody01,'hookCommandHandlerBody01')}default:`,
'hookCommandHandlerBody01/hookCmdHandleSection03': ({hookCmdHandleSection03})=>` {
      ${run(hookCmdHandleSection03, 'hookCmdHandleSection03')}
      } 
      `,
'hookCmdHandleSection03/hookHandlerName03,hookHandlerBody03': ({hookHandlerName03, hookHandlerBody03})=>`case "${run(hookHandlerName03,'hookHandlerName03')}":${run(hookHandlerBody03,'hookHandlerBody03')}break;`,
'hookCmdHandler02/hookCommandHandlerBody02': ({hookCommandHandlerBody02})=>`switch (message.command)${run(hookCommandHandlerBody02,'hookCommandHandlerBody02')}default:`,
'hookCommandHandlerBody02/hookCmdHandleSection02,hookCmdHandleSection02': ({hookCmdHandleSection02})=>` {
      ${run(hookCmdHandleSection02, 'hookCmdHandleSection02')}
      ${run(hookCmdHandleSection02, 'hookCmdHandleSection02')}
      }
      `,
'hookCmdHandleSection02/hookHandlerName02,hookHandlerBody02': ({hookHandlerName02, hookHandlerBody02})=>`case "${run(hookHandlerName02,'hookHandlerName02')}":${run(hookHandlerBody02,'hookHandlerBody02')}break;`,
'panel.ts3f5913a659/fileContents1': ({fileContents1})=>`${run(fileContents1, 'fileContents1')}`,
'fileContents1/webviewCommandHandler01': ({webviewCommandHandler01})=>`
import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import * as fs from "fs";
import { readFile, runTs, saveFile, saveWord } from "./compiler";
import {
  argsAndTemplateToFunction,
  insertIntoTemplate,
  tts,
} from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";
import {
  getAllWordPathsByLastModified,
  getWordContents,
  getWordNamesFromWordPaths,
  sortFilesByLastModified,
  readFromConfig,
  getWordPath,
  storeFileHash,
  getFilePathHashes,
  overwriteFile,
  getAllFileTemplates,
  saveRunnableWord,
  getAllRunnableWords,
  createRunnableGeneratorFileContents,
} from "./services/commandService";
import { sha1 } from "js-sha1";
import { runWord } from "./services/wordRunService";
import Runner, { DequeueConfig } from "./runner/runner";
import { fetchFromConfig } from "./services/configService";

export function formFilePathHash(filePath: string) {
  const fileName = filePath.split("/").pop();
  const fileHash = sha1(filePath);
  return ェ§{fileHash.substring(0, 10)}_§{fileName}ェ;
}

export function readFromFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf8", function (err, data) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

const TEST_DEQUEUE: DequeueConfig = {
  name: "test",
  description: "runs fs, grabs the useTemplate file, and takes off parsing it!",
  steps: [
    {
      type: "fs",
      config:
        "/Users/jaykoontz/Documents/GitHub/symmetric-blueprints/.fsconfig",
      name: "testGrab",
      description: "test fs!!",
      waitForTransitionCommand: false,
      transitionAction: "get",
      runWithEmptyTemplate: false,
      word: "getUseTemplate",
    },
    {
      type: "template",
      config:
        "/Users/jaykoontz/Documents/GitHub/symmetric-blueprints/.spconfig",
      name: "blank",
      description:
        "starts with blank template. fill with fifth.tsx to ready for next step!",
      waitForTransitionCommand: false,
      transitionAction: "identity",
      runWithEmptyTemplate: false,
    },
    {
      type: "template",
      config:
        "/Users/jaykoontz/Documents/GitHub/symmetric-blueprints/.spconfig",
      name: "parseFifth",
      description: "runs the word that parses fifth.tsx",
      word: "ponTesterQueue",
      waitForTransitionCommand: true,
      transitionAction: "identity", // nothing
      runWithEmptyTemplate: false,
    },
  ],
};
const BLANK_TEMPL_DEQUEUE: DequeueConfig = {
  name: "blank template",
  description: "starts out with an empty word",
  steps: [
    {
      type: "template",
      config:
        "/Users/jaykoontz/Documents/GitHub/symmetric-blueprints/.spconfig",
      name: "blankTempl",
      description:
        "starts with blank template. fill with fifth.tsx to ready for next step!",
      waitForTransitionCommand: true,
      transitionAction: "identity",
      runWithEmptyTemplate: false,
    },
  ],
};
const POL_DEUQUE: DequeueConfig = {
  name: "polTest",
  description: "grabs anything postMessage-related and queues the links",
  steps: [
    {
      type: "fs",
      config:
        "/Users/jaykoontz/Documents/GitHub/symmetric-blueprints/.fsconfig",
      name: "polFs",
      description:
      "grabs anything postMessage-related",
      waitForTransitionCommand: true,
      transitionAction: "get",
      runWithEmptyTemplate: false,
    },{
      type: "template",
      config:
        "/Users/jaykoontz/Documents/GitHub/symmetric-blueprints/.spconfig",
      name: "blankTempl",
      description:
        "starts with blank template. fill with files found from polTest step!",
      waitForTransitionCommand: true,
      word: "fromParserTest",
      transitionAction: "identity",
      runWithEmptyTemplate: false,
    },
  ]
}
const BLANK_FS_DEQUEUE: DequeueConfig = {
  name: "blank fs",
  description: "starts out with an empty word",
  steps: [
    {
      type: "fs",
      config:
        "/Users/jaykoontz/Documents/GitHub/symmetric-blueprints/.fsconfig",
      name: "blankFs",
      description:
        "starts with blank template. fill with fifth.tsx to ready for next step!",
      waitForTransitionCommand: true,
      transitionAction: "identity",
      runWithEmptyTemplate: false,
    },
  ],
};
const ALL_SERVICES_DEQUEUE: DequeueConfig = {
  name: "show all service files",
  description: "testing out how a multi-grab works",
  steps: [
    {
      type: "fs",
      config:
        "/Users/jaykoontz/Documents/GitHub/symmetric-blueprints/.fsconfig",
      name: "blankFs",
      description:
        "starts with blank template. fill with fifth.tsx to ready for next step!",
      waitForTransitionCommand: false,
      transitionAction: "get",
      runWithEmptyTemplate: false,
      word: "getServices",
    },
    {
      type: "template",
      config:
        "/Users/jaykoontz/Documents/GitHub/symmetric-blueprints/.spconfig",
      name: "allServicesTempl",
      description: "all the service files!",
      waitForTransitionCommand: true,
      transitionAction: "identity",
      runWithEmptyTemplate: false,
    },
  ],
};
const ALL_QUEUES = [
  TEST_DEQUEUE,
  BLANK_FS_DEQUEUE,
  BLANK_TEMPL_DEQUEUE,
  ALL_SERVICES_DEQUEUE,
  POL_DEUQUE
];

export default class PanelClass {
  public static currentPanel: PanelClass | undefined;

  private static readonly viewType = "PanelName";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _extContext: vscode.ExtensionContext;
  private _disposables: vscode.Disposable[] = [];
  private pathToConfig: string;
  private runner: Runner;

  public static createOrShow(extContext: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    // Otherwise, create a new panel.
    if (PanelClass.currentPanel) {
      PanelClass.currentPanel._panel.reveal(column);
    } else {
      // ReactPanel.currentPanel = new ReactPanel(extensionPath, column || vscode.ViewColumn.One);
      PanelClass.currentPanel = new PanelClass(
        extContext,
        vscode.ViewColumn.Two
      );
    }
  }

  public static async insertFileIntoTemplate(
    extContext: vscode.ExtensionContext
  ) {
    console.log("this is both broken and not going to be used anymore");
    const activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor == null) {
      return;
    }
    const activeEditorText = activeTextEditor.document.getText();
    const activeEditorFilePath = activeTextEditor.document.fileName;
    // we want to deterministically hash the filepath

    const filePathHash = formFilePathHash(activeEditorFilePath);
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    // Otherwise, create a new panel.
    if (PanelClass.currentPanel) {
      PanelClass.currentPanel._panel.reveal(column);
    } else {
      // ReactPanel.currentPanel = new ReactPanel(extensionPath, column || vscode.ViewColumn.One);
      PanelClass.currentPanel = new PanelClass(
        extContext,
        vscode.ViewColumn.Two
      );
    }

    // we also need to store this hash somewhere!
    console.log("DO WE HAVE PATH ", PanelClass.currentPanel.pathToConfig);
    storeFileHash(
      PanelClass.currentPanel.pathToConfig,
      filePathHash,
      activeEditorFilePath
    );

    /*PanelClass.currentPanel._panel.webview.postMessage({
      command: "file_insert",
      data: {
        contents: activeEditorText,
        filePath: filePathHash,
      },
    });*/
    const fileTemplates = await getAllFileTemplates(
      PanelClass.currentPanel.pathToConfig
    );
    PanelClass.currentPanel._panel.webview.postMessage({
      command: "all_file_templates",
      data: {
        fileTemplates: tts(fileTemplates, false),
      },
    });
  }
  //temporarily setting extcontext to any type
  private constructor(
    _extContext: vscode.ExtensionContext,
    column: vscode.ViewColumn
  ) {
    this._extContext = _extContext;
    this._extensionUri = _extContext.extensionUri;

    // Create and show a new webview panel
    function handleQueueUpdate() {
      
      const currentQueue = this.runner.steps?.map((step) => ({
        type: step.type,
        name: step.name,
        description: step.description,
        word: step.word ?? "-",
        isWaitingForCommand: step.waitForTransitionCommand,
        transitionAction: step.transitionAction,
      }))??[];
      console.log("queue update", currentQueue);
      this._panel!.webview.postMessage({
        command: "queue_update",
        data: {
          currentQueue: JSON.stringify(currentQueue),
        },
      });
    }
    this._panel = vscode.window.createWebviewPanel(
      PanelClass.viewType,
      "Blueprints",
      column,
      {
        // Enable javascript in the webview
        enableScripts: true,
        localResourceRoots: [this._extensionUri],
      }
    );

    // Set the webview's initial html content
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    //Listen to messages
    this._panel.${run(webviewCommandHandler01, 'webviewCommandHandler01')}
    );
  }

  public dispose() {
    PanelClass.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "main.wv.js")
    );

    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "styles.css")
    );

    const nonce = getNonce();

    return ェ<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Symmetric Blueprints</title>
        <link rel="stylesheet" href="§{styleUri}">
      </head>
      <body>
        <div id="root"></div>
        <script>
          global = window
          
          const vscode = acquireVsCodeApi();
          window.onload = function() {
            vscode.postMessage({ command: 'startup' });
            console.log('HTML started up.');
          };
        </script>
        <script nonce="§{nonce}" src="§{scriptUri}"></script>
      </body>
      </html>
    ェ;
  }
}
`,
'webviewCommandHandler01/webviewHandler01': ({webviewHandler01})=>`webview.onDidReceiveMessage(${run(webviewHandler01, 'webviewHandler01')}this._disposables`,
'webviewHandler01/panelCommand01,panelCommand02,panelCommand03,panelCommand04,panelCommand05,panelCommand06,panelCommand07,panelCommand08,panelCommand09,panelCommand010,panelCommand011,panelCommand012,panelCommand013,panelCommand014,panelCommand015,panelCommand016,panelCommand017': ({panelCommand01, panelCommand02, panelCommand03, panelCommand04, panelCommand05, panelCommand06, panelCommand07, panelCommand08, panelCommand09, panelCommand010, panelCommand011, panelCommand012, panelCommand013, panelCommand014, panelCommand015, panelCommand016, panelCommand017})=>`
      async (msg: any) => {
;
        switch (msg.command) {
          ${run(panelCommand01, 'panelCommand01')}
          }
          ${run(panelCommand02, 'panelCommand02')}
          ${run(panelCommand03, 'panelCommand03')}
          ${run(panelCommand04, 'panelCommand04')}
          ${run(panelCommand05, 'panelCommand05')}
          }
          ${run(panelCommand06, 'panelCommand06')}
          }
          ${run(panelCommand07, 'panelCommand07')}
          }
          ${run(panelCommand08, 'panelCommand08')}
          }
          ${run(panelCommand09, 'panelCommand09')}
          }
          ${run(panelCommand010, 'panelCommand010')}
          }
          ${run(panelCommand011, 'panelCommand011')}
          }
          ${run(panelCommand012, 'panelCommand012')}
          }
          ${run(panelCommand013, 'panelCommand013')}
          }
          ${run(panelCommand014, 'panelCommand014')}
          }
          ${run(panelCommand015, 'panelCommand015')}
          }
          ${run(panelCommand016, 'panelCommand016')}
          }
          ${run(panelCommand017, 'panelCommand017')}
        }
      },
      null,
      `,
'panelCommand01/panelCommandName01,panelCommandBody01': ({panelCommandName01, panelCommandBody01})=>`case "${run(panelCommandName01, 'panelCommandName01')}":${run(panelCommandBody01, 'panelCommandBody01')}break;`,
'panelCommand02/panelCommandName02,panelCommandBody02': ({panelCommandName02, panelCommandBody02})=>`case "${run(panelCommandName02, 'panelCommandName02')}":${run(panelCommandBody02, 'panelCommandBody02')}break;`,
'panelCommand03/panelCommandName03,panelCommandBody03': ({panelCommandName03, panelCommandBody03})=>`case "${run(panelCommandName03, 'panelCommandName03')}":${run(panelCommandBody03, 'panelCommandBody03')}break;`,
'panelCommand04/panelCommandName04,panelCommandBody04': ({panelCommandName04, panelCommandBody04})=>`case "${run(panelCommandName04, 'panelCommandName04')}":${run(panelCommandBody04, 'panelCommandBody04')}break;`,
'panelCommand05/panelCommandName05,panelCommandBody05': ({panelCommandName05, panelCommandBody05})=>`case "${run(panelCommandName05, 'panelCommandName05')}":${run(panelCommandBody05, 'panelCommandBody05')}break;`,
'panelCommand06/panelCommandName06,panelCommandBody06': ({panelCommandName06, panelCommandBody06})=>`case "${run(panelCommandName06, 'panelCommandName06')}":${run(panelCommandBody06, 'panelCommandBody06')}break;`,
'panelCommandBody06/webviewPostMessageName112': ({webviewPostMessageName112})=>` {
            const { word } = msg;
            const pathToConfig = this.runner.currentStep.config;
            console.log("STORING RUNNABLE WORD", word, pathToConfig);
            try {
              await saveRunnableWord(pathToConfig, word);
              const runnableWords = await getAllRunnableWords(pathToConfig);
              this._panel!.webview.postMessage({
                ${run(webviewPostMessageName112, 'webviewPostMessageName112')}
                data: {
                  runnableWords: JSON.stringify(runnableWords),
                },
              });
            } catch (e) {
              console.error(e);
            }
            `,
'webviewPostMessageName112/webviewCommandName112': ({webviewCommandName112})=>`command: "${run(webviewCommandName112, 'webviewCommandName112')}",`,
'panelCommand07/panelCommandName07,panelCommandBody07': ({panelCommandName07, panelCommandBody07})=>`case "${run(panelCommandName07, 'panelCommandName07')}":${run(panelCommandBody07, 'panelCommandBody07')}break;`,
'panelCommandBody07/webviewPostMessageName111': ({webviewPostMessageName111})=>` {
            const { wordName } = msg;
            const pathToConfig = this.runner.currentStep.config;
            const wordPath = await getWordPath(pathToConfig, wordName);
            const wordContents = await getWordContents(wordPath);
            this._panel!.webview.postMessage({
              ${run(webviewPostMessageName111, 'webviewPostMessageName111')}
              data: {
                wordName,
                wordContents,
              },
            });
            `,
'webviewPostMessageName111/webviewCommandName111': ({webviewCommandName111})=>`command: "${run(webviewCommandName111, 'webviewCommandName111')}",`,
'panelCommand08/panelCommandName08,panelCommandBody08': ({panelCommandName08, panelCommandBody08})=>`case "${run(panelCommandName08, 'panelCommandName08')}":${run(panelCommandBody08, 'panelCommandBody08')}break;`,
'panelCommandBody08/webviewPostMessageName110': ({webviewPostMessageName110})=>` {
            const { wordName, template } = msg;
            const pathToConfig = this.runner.currentStep.config;
            const projectDir = await readFromConfig(
              "PROJECT_DIR",
              pathToConfig
            );
            const wordFile = projectDir + "/word_" + wordName + ".json";
            // eventually, result might be something more, like a file insertion
            let wordTemplate = "{}";
            if (template != null) {
              wordTemplate = template;
            }
            let wordContents = JSON.stringify([{ result: wordTemplate }]);
            await saveFile(wordFile, wordContents);
            this._panel!.webview.postMessage({
              ${run(webviewPostMessageName110, 'webviewPostMessageName110')}
              data: {
                wordName,
                wordContents,
              },
            });
            `,
'webviewPostMessageName110/webviewCommandName110': ({webviewCommandName110})=>`command: "${run(webviewCommandName110, 'webviewCommandName110')}",`,
'panelCommand09/panelCommandName09,panelCommandBody09': ({panelCommandName09, panelCommandBody09})=>`case "${run(panelCommandName09, 'panelCommandName09')}":${run(panelCommandBody09, 'panelCommandBody09')}break;`,
'panelCommandBody09/webviewPostMessageName19': ({webviewPostMessageName19})=>` {
            // a full template doesn't need to be generated
            // it's the actual object that is a template
            // we just need to add it to the template pool
            const { template, name } = msg;
            const pathToConfig = this.runner.currentStep.config;
            const templatesFilePath = await readFromConfig(
              "TEMPLATE_FILE",
              pathToConfig
            );
            const templatesFile = await readFromFile(templatesFilePath);
            console.log("CURR TEMPLATES FILE", templatesFile);
            // write template to templates file
            const newTemplatesFile =
              templatesFile + "Øn" + ェexport const §{name} = §{template}ェ;
            console.log("NEW TEMPLATES FILE", newTemplatesFile);
            fs.writeFile(templatesFilePath, newTemplatesFile, (err) => {
              if (err) {
                console.error(err);
              }
              console.log("success");
            });

            // bun run the file and send the result to the frontend
            const projectDir = await readFromConfig(
              "PROJECT_DIR",
              pathToConfig
            );
            const templateModule = await runTs(
              projectDir + "/template-getter.ts"
            );
            console.log("ALL OF TEMPLATE MODULE", templateModule);
            this._panel!.webview.postMessage({
              ${run(webviewPostMessageName19, 'webviewPostMessageName19')}
              data: {
                templateModule,
              },
            });
            `,
'webviewPostMessageName19/webviewCommandName19': ({webviewCommandName19})=>`command: "${run(webviewCommandName19, 'webviewCommandName19')}",`,
'panelCommand010/panelCommandName010,panelCommandBody010': ({panelCommandName010, panelCommandBody010})=>`case "${run(panelCommandName010, 'panelCommandName010')}":${run(panelCommandBody010, 'panelCommandBody010')}break;`,
'panelCommandBody010/webviewPostMessageName18': ({webviewPostMessageName18})=>` {
            const { key, args, value } = msg;
            const funcPart = argsAndTemplateToFunction([], value);
            const templ = { [key]: funcPart };
            const templateString = ェgenTemplateWithVars(§{tts(
              templ,
              false
            )}, §{args});ェ;
            const pathToConfig = this.runner.currentStep.config;
            const templatesFilePath = await readFromConfig(
              "TEMPLATE_FILE",
              pathToConfig
            );
            const templatesFile = await readFromFile(templatesFilePath);
            console.log("CURR TEMPLATES FILE", templatesFile);
            // write template to templates file
            const newTemplatesFile =
              templatesFile + "Øn" + ェexport const §{key} = §{templateString}ェ;
            console.log("NEW TEMPLATES FILE", newTemplatesFile);
            fs.writeFile(templatesFilePath, newTemplatesFile, (err) => {
              if (err) {
                console.error(err);
              }
              console.log("success");
            });

            // bun run the file and send the result to the frontend
            const projectDir = await readFromConfig(
              "PROJECT_DIR",
              pathToConfig
            );
            const templateModule = await runTs(
              projectDir + "/template-getter.ts"
            );
            this._panel!.webview.postMessage({
              ${run(webviewPostMessageName18, 'webviewPostMessageName18')}
              data: {
                templateModule,
              },
            });

            `,
'webviewPostMessageName18/webviewCommandName18': ({webviewCommandName18})=>`command: "${run(webviewCommandName18, 'webviewCommandName18')}",`,
'panelCommand011/panelCommandName011,panelCommandBody011': ({panelCommandName011, panelCommandBody011})=>`case "${run(panelCommandName011, 'panelCommandName011')}":${run(panelCommandBody011, 'panelCommandBody011')}break;`,
'panelCommandBody011/webviewPostMessageName17': ({webviewPostMessageName17})=>` {
            const pathToConfig = this.runner.currentStep.config;
            const { generatorString, template, msgId } = msg;
            console.log(
              "RUNNING",
              "msgId",
              msgId,
              "AND",

              generatorString,
              pathToConfig
            );
            const projectDir = await readFromConfig(
              "PROJECT_DIR",
              pathToConfig
            );
            const filePrefix = Date.now();
            const generatorRunFile = await createRunnableGeneratorFileContents(
              pathToConfig,
              generatorString,
              template
            );
            const generatorFile = filePrefix + "_generator.ts";
            const resultFile = filePrefix + "_result";
            const genFilePath = projectDir + "/" + generatorFile;
            const resultFilePath = projectDir + "/" + resultFile;
            await saveFile(genFilePath, generatorRunFile);
            const result = await runTs(genFilePath);
            console.log("RESULTv,", result);
            await saveFile(resultFilePath, result);

            this._panel!.webview.postMessage({
              ${run(webviewPostMessageName17, 'webviewPostMessageName17')}
              data: {
                msgId,
                generatorFilePath: genFilePath,
                resultFilePath: resultFilePath,
                result,
                generatorString,
              },
            });
            `,
'webviewPostMessageName17/webviewCommandName17': ({webviewCommandName17})=>`command: "${run(webviewCommandName17, 'webviewCommandName17')}",`,
'panelCommand012/panelCommandName012,panelCommandBody012': ({panelCommandName012, panelCommandBody012})=>`case "${run(panelCommandName012, 'panelCommandName012')}":${run(panelCommandBody012, 'panelCommandBody012')}break;`,
'panelCommandBody012/webviewPostMessageName16': ({webviewPostMessageName16})=>` {
            const { wordName, template, msgId } = msg;
            const pathToConfig = this.runner.currentStep.config;
            const {
              template: result,
              wordRunFilePath,
              resultFilePath,
              queuedTemplates,
            } = await runWord(pathToConfig, wordName, template);
            // ADD queuedTemplates TO RUNNER
            this.runner.addSubTemplatesToQueue(queuedTemplates);
            // the queued items will change in the queue header
            // so the user will know buildQueue affected the queue
            this._panel!.webview.postMessage({
              ${run(webviewPostMessageName16, 'webviewPostMessageName16')}
              data: {
                msgId,
                wordRunFilePath: wordRunFilePath,
                resultFilePath: resultFilePath,
                result,
                wordString: ェ§{wordName}(template)ェ,
              },
            });
            `,
'webviewPostMessageName16/webviewCommandName16': ({webviewCommandName16})=>`command: "${run(webviewCommandName16, 'webviewCommandName16')}",`,
'panelCommand013/panelCommandName013,panelCommandBody013': ({panelCommandName013, panelCommandBody013})=>`case "${run(panelCommandName013, 'panelCommandName013')}":${run(panelCommandBody013, 'panelCommandBody013')}break;`,
'panelCommandBody013/webviewPostMessageName15': ({webviewPostMessageName15})=>` {
            const { msgId, filledGenerator } = msg;
            const pathToConfig = this.runner.currentStep.config;
            const projectDir = await readFromConfig(
              "PROJECT_DIR",
              pathToConfig
            );
            const filledGeneratorsPath = projectDir + "/filledGenerators.json";

            let currentFilledGenerators;
            try {
              currentFilledGenerators = await readFile(filledGeneratorsPath);
            } catch {
              currentFilledGenerators = "{}";
            }
            const cfgTemplate: Template = new Function(
              "return " + currentFilledGenerators
            )();
            const filledGeneratorTemplate: Template = new Function(
              "return " + filledGenerator
            )();
            const newFilledGenerators = insertIntoTemplate(
              cfgTemplate,
              filledGeneratorTemplate
            );
            await saveFile(
              filledGeneratorsPath,
              tts(newFilledGenerators, false)
            );
            this._panel!.webview.postMessage({
              ${run(webviewPostMessageName15, 'webviewPostMessageName15')}
              data: {
                msgId,
                allFilledGenerators: tts(newFilledGenerators, false),
              },
            });
            `,
'webviewPostMessageName15/webviewCommandName15': ({webviewCommandName15})=>`command: "${run(webviewCommandName15, 'webviewCommandName15')}",`,
'panelCommand014/panelCommandName014,panelCommandBody014': ({panelCommandName014, panelCommandBody014})=>`case "${run(panelCommandName014, 'panelCommandName014')}":${run(panelCommandBody014, 'panelCommandBody014')}break;`,
'panelCommandBody014/webviewPostMessageName14': ({webviewPostMessageName14})=>` {
            const { wordSteps, wordName, msgId } = msg;
            if (
              wordSteps.length === 0 ||
              wordSteps === "" ||
              wordSteps == null
            ) {
              throw new Error("No steps to save");
            }
            const pathToConfig = this.runner.currentStep.config;
            const projectDir = await readFromConfig(
              "PROJECT_DIR",
              pathToConfig
            );
            const wordFile = projectDir + "/word_" + wordName + ".json";
            await saveFile(wordFile, wordSteps);
            this._panel!.webview.postMessage({
              ${run(webviewPostMessageName14, 'webviewPostMessageName14')}
              data: {
                msgId,
              },
            });
            `,
'webviewPostMessageName14/webviewCommandName14': ({webviewCommandName14})=>`command: "${run(webviewCommandName14, 'webviewCommandName14')}",`,
'panelCommand015/panelCommandName015,panelCommandBody015': ({panelCommandName015, panelCommandBody015})=>`case "${run(panelCommandName015, 'panelCommandName015')}":${run(panelCommandBody015, 'panelCommandBody015')}break;`,
'panelCommandBody015/webviewPostMessageName13': ({webviewPostMessageName13})=>` {
            const { template } = msg;
            await this.runner.transition(template);
            const pathToConfig = this.runner.currentStep.config;
            console.time("fetchFromConfig");
            const data = await fetchFromConfig(pathToConfig, this.runner);
            console.timeEnd("fetchFromConfig");
            // so on transition:
            // get the config from the step
            // fetch it all (make a service for it)
            // send it to the frontend like we do on startup
            // also send the current template as a new word result
            this._panel!.webview.postMessage({
              ${run(webviewPostMessageName13, 'webviewPostMessageName13')}
              data: {
                ...data,
                queueNames: JSON.stringify(ALL_QUEUES.map((q) => q.name)),
                subTemplate: this.runner.currentStep.subTemplate,
              },
            });
            `,
'webviewPostMessageName13/webviewCommandName13': ({webviewCommandName13})=>`command: "${run(webviewCommandName13, 'webviewCommandName13')}",`,
'panelCommand016/panelCommandName016,panelCommandBody016': ({panelCommandName016, panelCommandBody016})=>`case "${run(panelCommandName016, 'panelCommandName016')}":${run(panelCommandBody016, 'panelCommandBody016')}break;`,
'panelCommandBody016/webviewPostMessageName12': ({webviewPostMessageName12})=>` {
            if (!ALL_QUEUES.some((q) => q.name === msg.queueName)) {
              console.log(
                "queue name vs ALL_QUEUES",
                msg.queueName,
                ALL_QUEUES
              );
              throw new Error("Queue not found, how did this happen?");
            }
            this.runner = new Runner(
              ALL_QUEUES.find((q) => q.name === msg.queueName).steps
            );
            this.runner.initNextStep();
            const pathToConfig = this.runner.currentStep.config;
            const data = await fetchFromConfig(pathToConfig, this.runner);
            this._panel!.webview.postMessage({
              ${run(webviewPostMessageName12, 'webviewPostMessageName12')}
              data: {
                ...data,
                queueNames: JSON.stringify(ALL_QUEUES.map((q) => q.name)),
              },
            });
            `,
'webviewPostMessageName12/webviewCommandName12': ({webviewCommandName12})=>`command: "${run(webviewCommandName12, 'webviewCommandName12')}",`,
'panelCommand017/panelCommandName017,panelCommandBody017': ({panelCommandName017, panelCommandBody017})=>`case "${run(panelCommandName017, 'panelCommandName017')}":${run(panelCommandBody017, 'panelCommandBody017')}break;`,
'panelCommandBody017/webviewPostMessageName11': ({webviewPostMessageName11})=>`
            try {
              const {queueName} = msg;
              if(queueName == null) {
                throw new Error("Queue name is null");
              }
              const queue = ALL_QUEUES.find((q) => q.name === queueName);
              this.runner = new Runner(queue.steps);
              await this.runner.initNextStep();
              this.runner.unsubscribe("queueUpdate");
              this.runner.subscribe("queueUpdate", handleQueueUpdate.bind(this));

              // data will equal:
              // GENERATOR_FILE=src/generators/wordBuilder.ts
              // TEMPLATE_FILE=src/templates/wordBuilder.ts
              // WORDS_FILE=src/words/wordBuilder.ts
              // we want to parse each file path and send it back to the webview
              const data = await fetchFromConfig(
                this.runner.currentStep.config,
                this.runner
              );
              this._panel!.webview.postMessage({
                ${run(webviewPostMessageName11, 'webviewPostMessageName11')}
                data: {
                  ...data,
                  queueNames: JSON.stringify(ALL_QUEUES.map((q) => q.name)),
                },
              });

              //this._panel!.webview.postMessage({ command: 'config_data', data });
            } catch (e) {
              console.error(e);
            }
            `,
'webviewPostMessageName11/webviewCommandName11': ({webviewCommandName11})=>`command: "${run(webviewCommandName11, 'webviewCommandName11')}",`,
'commandName01': ()=>`select_queue`,
'commandName02': ()=>`add_template`,
'commandName03': ()=>`create_word`,
'commandName04': ()=>`get_word`,
'commandName05': ()=>`writeFile`,
'commandName06': ()=>`fetch_from_config`,
'commandName07': ()=>`save_all_files`,
'commandName08': ()=>`add_filled_generator`,
'commandName09': ()=>`add_template`,
'commandName10': ()=>`add_full_template`,
'commandName11': ()=>`save_word`,
'commandName12': ()=>`run_generator`,
'commandName13': ()=>`save_word_steps`,
'fileContents3': ()=>`
import { readFromConfig } from "./commandService";
import { runTs, saveFile } from "../compiler";
import { formWordRunFile, QUEUE_SPLITTER, RESULT_SPLITTER } from "./hardToParse/util";

export type TemplateAsString = string;

export type WordRunResult = {
  template: string;
  wordRunFilePath: string;
  resultFilePath: string;
  queuedTemplates: string[];
};

type WordRunParse = {
  template: string;
  queue: string[];
}
function parseWordRunResult(result: string): WordRunParse {
  const split = result.split(RESULT_SPLITTER);
  const template = split[0];
  const queue = split[1];
  if(queue!=null) {
    const queueTemplates = queue.split(QUEUE_SPLITTER).filter(q=>q.length>0).map(q=>q.trim());

    return {
      template,
      queue: queueTemplates
    }
  
  } else {
    return {template, queue: []}
  }

}
// !!: the template is passed in as a string
// and the return is also a string
// this is bc it's from the command line.
export async function runWord(
  pathToConfig: string,
  wordName: string,
  templateAsString: TemplateAsString
): Promise<WordRunResult> {
  const projectDir = await readFromConfig("PROJECT_DIR", pathToConfig);
  const filePrefix = Date.now();
  const wordRunFile = formWordRunFile(wordName, templateAsString);
  const wordRunFileName = filePrefix + "_wordRun.ts";
  const resultFile = filePrefix + "_result";
  const wordRunFilePath = projectDir + "/" + wordRunFileName;
  const resultFilePath = projectDir + "/" + resultFile;
  // saveFile doesn't belong here
  await saveFile(wordRunFilePath, wordRunFile);
  const result = await runTs(wordRunFilePath);
  console.log("ran word")
  const { template, queue } = parseWordRunResult(result);
  console.log("word run RESULTv,", template);
  await saveFile(resultFilePath, template+"Øn"+queue.join("Øn"));
  return {
    template,
    queuedTemplates: queue,
    wordRunFilePath,
    resultFilePath,
  };
}
`,
'fileContents4': ()=>`
import { Template } from "symmetric-parser/dist/src/templator/template-group";
import { TemplateAsString } from "./wordRunService";
import {
  getAllFileTemplates,
  readFromConfig,
  storeFileHashes,
} from "./commandService";

import { promises as fs } from "fs";
import * as path from "path";
import { insertIntoTemplate, orderedParse, tts } from "symmetric-parser";
import { formFilePathHash } from "../panel";

export const identity = async (
  pathToConfig: string,
  input: TemplateAsString
) => {
  return input;
};

export const get = async (pathToConfig: string, input: TemplateAsString) => {
  const baseDir = await readFromConfig("BASE_DIR", pathToConfig);
  const ignore = await readFromConfig("IGNORE", pathToConfig);
  const parseTemplate = new Function("return " + input)();
  const excludeTempl = {};
  Object.keys(parseTemplate).filter((key) => key.includes("excludePath")).forEach((key) => {
    excludeTempl[key] = parseTemplate[key]
  })
  const excludeValues = Object.keys(excludeTempl).map((key) => excludeTempl[key]());
  const allFilePaths = await getAllFilePaths(baseDir, [ignore,...excludeValues]);

  const allFilePathsTemplate: Template = allFilePaths.reduce(
    (t: Template, path: string) => {
      const rt = insertIntoTemplate(t, { localFilePath: () => path });
      return rt;
    },
    {}
  );

console.log("THE PARSE TEMPLAT", tts(parseTemplate, false))

  const includeTempl = {};
  Object.keys(parseTemplate).filter((key) => key.includes("filePath")).forEach((key) => {
    includeTempl[key] = parseTemplate[key]
  })


  const division = orderedParse(allFilePathsTemplate, [includeTempl]);

  // find all keys with filePath in the denominator
  const filePaths = Object.keys(division)
    .filter((key) => key.includes("/filePath"))
    .map((test) => {
      console.log("TEST", test);
      return test;
    })
    .map((key) => key.split("/")[0])
    .map((numerator) => allFilePathsTemplate[numerator]());




  const filePathHashesMap = {};

  filePaths.forEach(
    (filePath) => (filePathHashesMap[filePath] = formFilePathHash(filePath))
  );

  await storeFileHashes(pathToConfig, filePathHashesMap);

  const fileTemplates = await getAllFileTemplates(pathToConfig, filePaths);

  return tts(fileTemplates, false);
};

export const getOrCreate = async (
  pathToConfig: string,
  input: TemplateAsString
) => {
  return input;
};

async function getAllFilePaths(dir: string, ignoreAll: string[]): Promise<string[]> {
  let results: string[] = [];

  // Read directory entries (files & folders)
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    // Construct the full path
    const fullPath = path.join(dir, entry.name);

    // Skip if the path includes the ignore string
    if (ignoreAll && ignoreAll.some(i=>fullPath.includes(i))) {
      continue;
    }

    // Check if the entry is a directory or a file
    if (entry.isDirectory()) {
      // Recursively gather paths from the subdirectory
      const subPaths = await getAllFilePaths(fullPath, ignoreAll);
      results.push(...subPaths);
    } else {
      // It's a file; add to results
      results.push(fullPath);
    }
  }

  return results;
}
`,
'fileContents5': ()=>`
import { tts } from "symmetric-parser";
import { runTs } from "../compiler";
import { readFromFile } from "../panel";
import {
  getAllFileTemplates,
  getAllRunnableWords,
  getAllWordPathsByLastModified,
  getWordNamesFromWordPaths,
  readFromConfig,
  readMultipleFromConfig,
  sortFilesByLastModified,
} from "./commandService";
import Runner from "../runner/runner";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

type DataFromConfigSO = {
  generators: string;
  templates: string;
  filledGenerators: string;
  currentWord: string;
  currentWordName: string;
  wordNames: string;
  templateModule: string;
  fileTemplates: string;
  runnableWords: string;
};

// the coupling with Runner is unfortunate, but I don't care.
// we need it for the current template and name, and doing that
// outside this function is just a weird layer of indirection.
// though maybe we'll eat our words. til then
export async function fetchFromConfig(
  pathToConfig: string,
  runner: Runner
): Promise<DataFromConfigSO> {
  try {
    const [projectDir, generatorPath, templatePath] =
      await readMultipleFromConfig(
        ["PROJECT_DIR", "GENERATOR_FILE", "TEMPLATE_FILE"],
        pathToConfig
      );
    const filledGeneratorsPath = projectDir + "/filledGenerators.json";

    const promises = [
      readFromFile(generatorPath),
      readFromFile(templatePath),
      readFromFile(filledGeneratorsPath),
      getAllRunnableWords(pathToConfig),
      getAllWordPathsByLastModified(pathToConfig),
      runTs(projectDir + "/template-getter.ts"),
      getAllFileTemplates(pathToConfig),
      // once upon a time, we initialized the UI
      // with word = last edited word.
      // it had downsides, like what if you just
      // edited generators?
      // but mostly it didn't fit with our new
      // Runner/dequeue paradigm.
      // getWordContents(sortedWordPaths[0]),
    ];

    //console.log("FROM STARTUP TEMPLATE MODEUL", templateModule);
    /* part of old Word-based regime, replaced with new Runner/dequeue paradigm
      const currentWordName = sortedWordPaths[0]
        .split("_")[1]
        .replace(".json", "");
        */

    const currentWord = [{ result: runner.currentTemplate }];
    const currentWordName =
      runner.currentStep.name + Date.now().toString().substring(7);
    return Promise.all(promises).then((data) => {
      const [
        generators,
        templates,
        filledGenerators,
        runnableWords,
        allWordPaths,
        templateModule,
        fileTemplates,
      ] = data;
      const wordNames = getWordNamesFromWordPaths(allWordPaths as string[]);

      return {
        generators: generators as string,
        templates: templates as string,
        filledGenerators: filledGenerators as string,
        currentWord: JSON.stringify(currentWord),
        currentWordName: currentWordName as string,
        wordNames: JSON.stringify(wordNames),
        templateModule: templateModule as string,
        fileTemplates: tts(fileTemplates as Template, false),
        runnableWords: JSON.stringify(runnableWords),
      };
    });
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}
`,
'fileContents6': ()=>`
import { promises as fs } from "fs";
import { compact, uniq } from "lodash";
import path from "path";
import {
  argsAndTemplateToFunction,
  genTemplateWithVars,
  insertIntoTemplate,
  orderedParse,
  stringCleaning,
  stringUnCleaning,
  tts,
} from "symmetric-parser";

export async function appendToFile(filePath: string, data: string) {
  try {
    await fs.appendFile(filePath, data);
  } catch (error) {
    console.error(ェError appending to file: §{error.message}ェ);
    throw error;
  }
}

export async function readFromConfig(configVar: string, pathToConfig: string) {
  try {
    const data = await fs.readFile(pathToConfig, { encoding: "utf8" });

    const lines = data.split("Øn");
    const result = lines.find((line) => line.includes(configVar)).split("=")[1];
    return result;
  } catch (error) {
    console.error("WRONG CONFIG VAR NAME PROVIDED");

    throw error;
  }
}

export async function readMultipleFromConfig(configVars: string[], pathToConfig: string) {
  try {
    let results = [];
    const data = await fs.readFile(pathToConfig, { encoding: "utf8" });

    const lines = data.split("Øn");
    configVars.forEach((configVar) => {
      const result = lines.find((line) => line.includes(configVar)).split("=")[1];
      results.push(result);
    });
    
    return results;
  } catch (error) {
    console.error("WRONG CONFIG VAR NAME PROVIDED");

    throw error;
  }
}
export const getWordPath = async (pathToConfig: string, wordName: string) => {
  const projectDir = await readFromConfig("PROJECT_DIR", pathToConfig);
  const wordPaths = await getWordJsonFiles(projectDir);
  const wordNames = getWordNamesFromWordPaths(wordPaths);
  const wordIndex = wordNames.indexOf(wordName);
  return wordPaths[wordIndex];
};

const getHashFilePath = async (pathToConfig) => {
  const projectDir = await readFromConfig("PROJECT_DIR", pathToConfig);
  const hashFilePath = path.join(projectDir, "filePathHashes.txt");
  return hashFilePath;
};
export const storeFileHashes = async (
  pathToConfig: string,
  filePathHashesMap: Record<string, string>
) => {
  const allStores = Object.entries(filePathHashesMap).map(
    async ([filePath, fileHash]) => {
      return storeFileHash(pathToConfig, fileHash, filePath);
    }
  );
  return await Promise.all(allStores);
};
export const storeFileHash = async (
  pathToConfig: string,
  fileHash: string,
  filePath: string
) => {
  const hashFilePath = await getHashFilePath(pathToConfig);
  const currentHashes = await getFilePathHashes(pathToConfig);
  if (currentHashes[fileHash] !== undefined) {
    return;
  }
  await fs.appendFile(hashFilePath, ェ§{fileHash}=§{filePath}Ønェ);
};

export const getAllFileTemplates = async (
  pathToConfig: string,
  onlyIncludePaths?: string[]
) => {
  if (pathToConfig == null) {
    throw new Error("pathToConfig is null in getAllFileTemplates");
  }
  const currentHashes = await getFilePathHashes(pathToConfig);
  const filePaths = new Set<string>();
  for (const filePath of Object.values(currentHashes)) {
    if (onlyIncludePaths?.length > 0) {
      if (onlyIncludePaths?.includes(filePath)) {
        filePaths.add(filePath);
      }
    } else {
      filePaths.add(filePath);
    }
  }
  //console.log("getAllFileTemplates");
  //console.log("FILE PATHS", Array.from(filePaths));
  const readPromises = Array.from(filePaths).map(async (filePath) => {
    const data = await fs.readFile(filePath, { encoding: "utf8" });
    return { filePath, data };
  });
  const allFiles = await Promise.all(readPromises);
  //console.log("ALL FILES", allFiles);
  let allFileTemplates = {};
  let idx = 1;
  for (const file of allFiles) {
    const { filePath, data } = file;
    const cleanedData = stringCleaning(data);
    const fileHash = Object.keys(currentHashes).find(
      (key) => currentHashes[key] === filePath
    );
    if (fileHash == null) {
      throw new Error(
        "file hash not found in getAllFileTemplates, it should exist!!"
      );
    }
    // try with string cleaning
    const funcPart = argsAndTemplateToFunction([], cleanedData);
    if (funcPart == null || !(funcPart instanceof Function)) {
      throw new Error(
        "funcPart is null or not a Function type in getAllFileTemplates, it should exist!!"
      );
    }
    const readableFileHash = fileHash.split("_")[1] + fileHash.split("_")[0];
    const fileTempl = {};
    const newKey = "fileContents" + idx;
    fileTempl[newKey] = funcPart;
    const newTempl = genTemplateWithVars(
      {
        [readableFileHash]: () => ェ§{newKey}ェ,
      },
      [newKey]
    );
    allFileTemplates = { ...allFileTemplates, ...newTempl, ...fileTempl };
    idx++;
  }
  //console.log("ALL FILE TEMPLATES", allFileTemplates)
  return allFileTemplates;
};
export const getRawFilePathHashes = async (pathToConfig: string) => {
  const hashFilePath = await getHashFilePath(pathToConfig);
  const data = await fs.readFile(hashFilePath, { encoding: "utf8" });
  const lines = data.split("Øn");
  return lines;
};
export const getFilePathHashes = async (
  pathToConfig: string
): Promise<Record<string, string>> => {
  const lines = await getRawFilePathHashes(pathToConfig);
  // go from "hash=file/path/thing.ts" to {[hash]: "file/path/thing.ts"} in one object
  const cleanLines = uniq(compact(lines));
  const result = cleanLines.reduce((acc, line) => {
    const [hash, filePath] = line.split("=");
    acc[hash] = filePath;
    return acc;
  }, {});
  return result;
};
export const getFilePathFromHash = async (
  pathToConfig: string,
  fileHash: string
) => {
  const projectDir = await readFromConfig("PROJECT_DIR", pathToConfig);
  const hashFilePath = path.join(projectDir, "filePathHashes.txt");
  const data = await fs.readFile(hashFilePath, { encoding: "utf8" });
  const lines = data.split("Øn");
  const result = lines.find((line) => line.includes(fileHash)).split("=")[1];
  return result;
};
export const getFilePathFromHashes = (
  hashes: Record<string, string>,
  fileHash: string
) => {
  const result = hashes[fileHash];
  return result;
};
export const getWordNamesFromWordPaths = (wordPaths: string[]) => {
  const wordNames = wordPaths.map(
    (wordPath) => path.basename(wordPath, ".json").split("_")[1]
  );
  return wordNames;
};

export const getWordContents = async (wordPath: string) => {
  const wordContents = await fs.readFile(wordPath, { encoding: "utf8" });
  return wordContents;
};

export const sortFilesByLastModified = async (filePaths: string[]) => {
  const filesWithStats = await Promise.all(
    filePaths.map(async (file) => {
      const stats = await fs.stat(file); // Get file stats
      return { file, mtime: stats.mtime }; // Return file path and modified time
    })
  );

  // Sort by last modified date (mtime)
  filesWithStats.sort((a: any, b: any) => b.mtime - a.mtime); // Most recent first

  // Return sorted file paths
  return filesWithStats.map((item) => item.file);
};

export const getAllWordPathsByLastModified = async (pathToConfig: string) => {
  const projectDir = await readFromConfig("PROJECT_DIR", pathToConfig);
  const wordPaths = await getWordJsonFiles(projectDir);
  return wordPaths;
};
async function getWordJsonFiles(directory) {
  try {
    // Read all files from the directory
    const files = await fs.readdir(directory);

    // Filter files that start with 'word_' and have '.json' extension
    const wordJsonFiles = files
      .filter((file) => file.startsWith("word_") && file.endsWith(".json"))
      .map((file) => path.join(directory, file)); // Create full file paths

    return wordJsonFiles;
  } catch (error) {
    console.error(ェError reading directory: §{error.message}ェ);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export const overwriteFile = async (filePath: string, data: string) => {
  try {
    await fs
      .writeFile(filePath, data)
      .then(() => console.log(ェFile §{filePath} has been overwrittenェ));
  } catch (error) {
    console.error(ェError overwriting file: §{error.message}ェ);
    throw error;
  }
};

export const getAllGeneratorsExports = async (pathToConfig: string) => {
  const generatorFilePath = await readFromConfig(
    "GENERATOR_FILE",
    pathToConfig
  );
  const generatorFileContents = await fs.readFile(generatorFilePath, {
    encoding: "utf8",
  });
  // this will happen a lot. we'll need a good way to do it. IMO, find the exports via parsing
  const exportTempl = genTemplateWithVars(
    {
      exportDef: () => ェØnexport function exportName(ェ,
    },
    ["exportName"]
  );
  const fileTempl = {
    file: argsAndTemplateToFunction([], stringCleaning(generatorFileContents)),
  };
  const parsed = orderedParse(fileTempl, [exportTempl]);
  //console.log("THIS IS PARSED", parsed);
  const nameKeys = Object.keys(parsed).filter((k) =>
    k.startsWith("exportName")
  );
  const nameValues = nameKeys.map((k) => parsed[k]());
  //console.log("FOLUND ALL EXPORTS", nameValues);
  return nameValues;
};

export const getAllTemplateExports = async (pathToConfig: string) => {
  //console.log("get all template exports");
  const templateFilePath = await readFromConfig("TEMPLATE_FILE", pathToConfig);
  const templateFileContents = await fs.readFile(templateFilePath, {
    encoding: "utf8",
  });

  const exportTempl = genTemplateWithVars(
    {
      exportDef: () => ェØnexport const exportName = ェ,
    },
    ["exportName"]
  );
  //console.log("file contents", templateFileContents);
  const fileTempl = {
    file: argsAndTemplateToFunction([], stringCleaning(templateFileContents)),
  };
  //console.log("templTHIS IS FILE", tts(fileTempl, false));
  const parsed = orderedParse(fileTempl, [exportTempl]);
  //console.log("templTHIS IS PARSED", parsed);
  const nameKeys = Object.keys(parsed).filter((k) =>
    k.startsWith("exportName")
  );
  const nameValues = nameKeys.map((k) => stringUnCleaning(parsed[k]()));
 // console.log("templFOLUND ALL EXPORTS", nameValues);
  return nameValues;
};

export const saveRunnableWord = async (pathToConfig: string, word: string) => {
  const wordPath = await readFromConfig("WORDS_FILE", pathToConfig);
  const wordContents = await getWordContents(wordPath);
  const templates = await getAllTemplateExports(pathToConfig);
  const generators = await getAllGeneratorsExports(pathToConfig);
  const fullWordContents = ェ§{wordContents}Øn§{word}ェ;
  const importedTemplates = templates.filter((t) =>
    fullWordContents.includes(t)
  );
  const importedGenerators = generators.filter((g) =>
    fullWordContents.includes(g)
  );
  const templatesImport =
    importedTemplates.length > 0
      ? ェimport { §{importedTemplates.join(",Øn")} } from "./template-pool";ェ
      : "";
  const generatorsImport =
    importedGenerators.length > 0
      ? ェimport { §{importedGenerators.join(",Øn")} } from "symmetric-parser";ェ
      : "";

  const otherImports = ェimport flow from 'lodash/flow'ェ;

  const splitOldWord = wordContents.split(otherImports)[1];
  const wordContentsWithImports = ェ§{templatesImport}Øn§{generatorsImport}Øn§{otherImports}Øn§{splitOldWord}Øn§{word}ェ;

  await overwriteFile(wordPath, wordContentsWithImports);
};

export const createRunnableGeneratorFileContents = async (
  pathToConfig: string,
  generatorString: string,
  template: string
): Promise<string> => {
  const words = await getAllRunnableWords(pathToConfig);
  const templates = await getAllTemplateExports(pathToConfig);
  const generators = await getAllGeneratorsExports(pathToConfig);

  const importedTemplates = templates.filter((t) =>
    generatorString.includes(t)
  );
  const importedGenerators = generators.filter((g) =>
    generatorString.includes(g)
  );
  const importedWords = words.filter((w) => generatorString.includes(w));
  const generalImports = ェimport { getQueue, clearQueue } from "./word-pool";ェ;
  const templatesImport =
    importedTemplates.length > 0
      ? ェimport { §{importedTemplates.join(",Øn")} } from "./template-pool";Ønェ
      : "";
  const generatorsImport = ェimport {  tts,Ønrun,Øn§{importedGenerators.join(
    ",Øn"
  )} } from "symmetric-parser";Ønェ;
  const wordsImport =
    importedWords.length > 0
      ? ェimport { §{importedWords.join(",Øn")} } from "./word-pool";Ønェ
      : "";

  const allImports = ェ§{generalImports}Øn§{templatesImport}Øn§{generatorsImport}Øn§{wordsImport}ェ;

  const templateString = ェconst template = §{template};ェ;
  const generatorRun = ェ// @ts-ignoreØnconst result = §{generatorString};Ønconsole.log(tts(result,false));ェ;
  return ェ§{allImports}Øn§{templateString}Øn§{generatorRun}ェ;
};

export const getAllRunnableWords = async (pathToConfig: string) => {
  const wordFilePath = await readFromConfig("WORDS_FILE", pathToConfig);
  const wordFileContents = await fs.readFile(wordFilePath, {
    encoding: "utf8",
  });
  const wordTempl = genTemplateWithVars(
    {
      wordDef: () => ェØnexport const wordName = flow(ェ,
    },
    ["wordName"]
  );
  const fileTempl = {
    file: argsAndTemplateToFunction([], stringCleaning(wordFileContents)),
  };
  let parsed;
  try {
    parsed = orderedParse(fileTempl, [wordTempl]);
  } catch {
    return [];
  }
  //console.log("THIS IS PARSED", parsed);
  const nameKeys = Object.keys(parsed).filter((k) => k.startsWith("wordName"));
  const nameValues = nameKeys.map((k) => parsed[k]());
  //console.log("FOLUND ALL WORDS", nameValues);
  return nameValues;
};
`,
'fileContents7': ()=>`
import {
    genTemplateWithVars, recursiveFold
} from "symmetric-parser";


export function parseWords(wordFile: string) {
  const file = { file: () => wordFile };

  const words = genTemplateWithVars(
    {
      wordDef: () =>
        ェfunction word(input: Template): Template {bodyØn  return outputName;Øn}ェ,
    },
    ["word", "body", "outputName"]
  );

  const elements = genTemplateWithVars(
    {
      element: () => ェconst genOutput = elementName(genInputs);Ønェ, // very catch-able, be careful
    },
    ["elementName", "genInputs", "genOutput"]
  );

  const of = recursiveFold(
    file,
    [words, elements],
    [],
    { scope: () => ェØnェ },
    "  ",
    1
  );
  return { ...of.result, ...of.divisors };
}


`,
'fileContents8': ()=>`
// pattern is:
// if items.length < 26, we use a-z

import { BuilderGenerator } from "../hooks/useWordBuilder";

// if items.length > 26, we use aa, ab, ac, ... az, ba, bb, bc, ... zz
export function getHotKeyMapForItems<T>(items: T[]): Map<string, T> {
  // if doubled, we get 26^2 = 676 options
  const isDoubled = items.length > 26;
  let result = new Map<string, T>();

  if (isDoubled) {
    let master = "asdfghjklqwertyuiopzxcvbnm".split("");
    for (let i = 0; i < items.length; i++) {
      const first = i < 26 ? i % 26 : Math.floor(i / 26) - 1;

      const second = i % 26;

      const str = master[first] + master[second];

      result.set(str, items[i]);
    }
    return result;
  } else {
    "asdfghjklqwertyuiopzxcvbnm"
      .split("")
      .slice(0, items.length)
      .forEach((key, idx) => {
        result.set(key, items[idx]);
      });

    return result;
  }
}

// pattern is:
// index of step + output index
// so step 0, output 0 is 01 for first output
// if we have 10 steps, we add a 0 to the front of the first 9
// ex: 001, 012, 101
// we will never have more than 9 outputs, god forbid.

export function getHotkeyMapForOutputItems(
  steps: BuilderGenerator[],
  selectedStepIdx: number
): Map<string, any> {
  let result = new Map<string, any>();
  // what's the string length of 10? -> 2.
  const size = Number(steps.length).toString().length;
  steps.forEach((step, idx) => {
    if (idx >= selectedStepIdx) {
      return;
    }
    const outputName = step.outputName;
    console.log("step", idx, "padded", padNumber(size, idx), outputName);
    result.set(padNumber(size, idx), outputName);
  });
  return result;
}
function padNumber(size, number) {
  // Convert the number to a string
  let numberStr = number.toString();

  // Calculate the number of leading zeros needed
  let zerosNeeded = size - numberStr.length;

  // Pad the number with leading zeros if necessary
  if (zerosNeeded > 0) {
    numberStr = "0".repeat(zerosNeeded) + numberStr;
  }

  return numberStr;
}
export function hotKeyToItem<T>(hotKey: string, hotKeys: Map<string, T>) {
  return hotKeys.get(hotKey);
}

export function itemToHotKey<T>(item: T, hotKeys: Map<string, T>) {
  return [...hotKeys.entries()].find(([key, value]) => value === item)?.[0];
}
`,
'fileContents9': ()=>`
import { collapseTemplateAtKey, genTemplateWithVars, joiner, recursiveFold, replaceWithAllIsomorphic, stringCleaning, stringUnCleaning } from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

export function parseTemplates(file: Template) {
    // need to parse out ェ...ェ
    const template = genTemplateWithVars(
      {
        templateDefinition: () => ェexport const templateName = {templateBodyØn};ェ,
      },
      ["templateName", "templateBody"]
    );
    // parsing itself, look at it go!
    const gendTemplate = genTemplateWithVars(
      {
        genTemplate: () =>
          ェexport const templateName = genTemplateWithVars(Øn  {templateBody},Øn  [genVars]Øn);ェ,
      },
      ["templateName", "templateBody", "genVars"]
    );
    const fr = recursiveFold(
      file,
      [template, gendTemplate], // sort by how specific something is... huh
      [],
      { scope: () => ェØnェ },
      "  ",
      1
    );
    //console.log(stringUnCleaning(tts(fr?.result ?? {})));
    // /console.log(stringUnCleaning(tts(fr?.divisors ?? {})));
    return { ...fr.result, ...fr.divisors };
  }


const templateMeta = genTemplateWithVars(
    {
      templateDefinition: () =>
        ェ{ name: "templateName", template: { templateBody } },ェ,
    },
    ["templateName", "templateBody"]
  );
  
  const genTemplateMeta = genTemplateWithVars(
    {
      genTemplate: () =>
        ェ{ name: "templateName", template: { templateBody }, vars: [genVars] },ェ,
    },
    ["templateName", "templateBody", "genVars"]
  );
  export function buildTemplateMeta(templateFile: string) {
    const cleaned = stringCleaning(templateFile);
    const file = { file: () => cleaned };
    const parsed = parseTemplates(file);
  
    const theMetaIso = replaceWithAllIsomorphic(parsed, [templateMeta]);
    const theMetaIso2 = replaceWithAllIsomorphic(theMetaIso, [genTemplateMeta]);
  
    const collapsed = collapseTemplateAtKey(theMetaIso2, "templateDefinition");
    const theStaticMeta = joiner(collapsed, "templateDefinition", "metas", "Øn");
    const theGenMeta = joiner(collapsed, "genTemplate", "metas", "Øn");
  
    const templatesString = stringUnCleaning(
      "[" + theStaticMeta["metas"]() + ", " + theGenMeta["metas"]() + "]"
    );
  
    return eval(templatesString);
  }
  
  `,
'fileContents10': ()=>`
import { cloneDeep } from "lodash";

export function setKeyValue(key, value, objInput) {
    const obj = cloneDeep(objInput);
    if (Array.isArray(obj)) {
        obj.forEach(function(element) {
            setKeyValue(key, value, element);
        });
    } else if (typeof obj === 'object' && obj !== null) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (prop === key) {
                    obj[prop] = value;
                }
                if (typeof obj[prop] === 'object' && obj[prop] !== null) {
                    setKeyValue(key, value, obj[prop]);
                }
            }
        }
    }
    return obj;
}`,
'fileContents14': ()=>`
import { compact } from "lodash";
import { useEffect, useState } from "react";

import {
  BuilderGenerator,
  BuilderNewWord,
  BuilderTemplate,
  BuilderWord,
} from "./useWordBuilder";
import {  parseWords } from "../util/parsers/parseWords";
import { parseGenerators } from "../util/parsers/parseGenerators";
import { buildTemplateMeta } from "../util/parsers/parseTemplates";

export function useMeta({
  wordsFileText,
  templatesFileText,
  generatorsFileText,
}: {
  wordsFileText: string;
  templatesFileText: string;
  generatorsFileText: string;
}) {
  const [wordsMeta, setWordsMeta] = useState<BuilderWord[]>([]);
  const [templatesMeta, setTemplatesMeta] = useState<BuilderTemplate[]>([]);
  const [generatorsMeta, setGeneratorsMeta] = useState<BuilderGenerator[]>([]);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  useEffect(() => {
    // start with fake, move to ....how do we get from file system.
    // VS Code API. do that separately?
    // need to turn input into meta.

    const parsedWords = parseWords(wordsFileText);
    const parsedGenerators = parseGenerators(generatorsFileText);

    const parsedTemplates = buildTemplateMeta(templatesFileText);
    console.log("PARSEDAND GOOD", {
      parsedWords,
      parsedGenerators,
      parsedTemplates,
    });

    // grab all the meta! apply to the objects! go go go!
    setWordsMeta([
      {
        name: "combineEverything",
        steps: [],
      },
    ]); 
    setGeneratorsMeta(parsedGenerators);
    setTemplatesMeta(compact(parsedTemplates));
  }, [generatorsFileText, templatesFileText, wordsFileText]);
  return { wordsMeta, templatesMeta, generatorsMeta };
}
`,
'fileContents15': ()=>`
import { useState, useEffect, useCallback } from 'react';

export const useHotkeys = (hotkeysArray, callback, options = { enabled: true }) => {
  // State to keep track of key sequences
  const [keySequence, setKeySequence] = useState('');

  const handleKeyDown = useCallback(
    (event) => {
      if (!options.enabled) return;

      if (event.target.tagName === 'INPUT') {
        return;
      }

      const key = event.key.toLowerCase();

      // Append the new key to the sequence
      const newSequence = keySequence + key;

      // Check if the new sequence matches any of the hotkeys in the array
      const matchedHotkey = hotkeysArray.find((hotkey) => newSequence.endsWith(hotkey));

      if (matchedHotkey) {
        // Trigger the callback with the matched hotkey
        callback({key: matchedHotkey});
        // Reset the sequence
        setKeySequence('');
      } else {
        // Update the sequence with the new key
        setKeySequence(newSequence);
      }
      if(newSequence.length>hotkeysArray[0].length){
        setKeySequence('');
      }
    },
    [keySequence, hotkeysArray, callback, options.enabled]
  );

  useEffect(() => {
    if (options.enabled) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, options.enabled]);

  return {
    clearSequence: () => setKeySequence(''),
  };
};

export default useHotkeys;
`,
'fileContents17': ()=>`
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
  const generalImports = ェimport { getQueue, clearQueue } from "./word-pool"
  import { §{templates.join(
    ",Øn"
  )} } from "./template-pool";ェ;
  const generatorsImport = ェimport { tts,Ønrun,Øn§{generators.join(
    ",Øn"
  )} } from "symmetric-parser";ェ;
  const templateString = ェconst template = §{tts(template, false)};ェ;
  const generatorRun = ェ// @ts-ignoreØnconst result = §{generatorString};Ønconsole.log(tts(result,false));ェ;
  return ェ§{generalImports}Øn§{generatorsImport}Øn§{templateString}Øn§{generatorRun}ェ;
}
`,
'fileContents18': ()=>`
import React, { FC } from 'react';

interface TreeNode {
  name: string;
  value: Function | null;
  children: { [key: string]: TreeNode };
}

const MyComponent: FC = () => {
  const code = ェ({ 
    'shop1/would1,test1': ({would1, test1})=>Øェhow Ø§{run(would1, 'would1')} you Ø§{run(test1, 'test1')} this tooØェ, 
    'would1/something1,something2': ({something1, something2})=>ØェØ§{run(something1,'something1')}Ø§{run(something2,'something2')}Øェ, 
    'shop2/would2,test2': ({would2, test2})=>Øェhow Ø§{run(would2, 'would2')} you Ø§{run(test2, 'test2')} this tooØェ, 
    'shop3/would3,test3': ({would3, test3})=>Øェhow Ø§{run(would3, 'would3')} you Ø§{run(test3, 'test3')} this tooØェ, 
    'something1': ()=>Øェsome valueØェ, 
    'something2': ()=>Øェanother one!Øェ 
  })ェ;

  // Parse the string into an object
  const obj: { [key: string]: Function } = new Function(ェreturn §{code}ェ)();

  // Build the tree structure from the keys
  const buildTree = (obj: { [key: string]: Function }): TreeNode => {
    const root: TreeNode = { name: 'root', value: null, children: {} };

    Object.entries(obj).forEach(([key, value]) => {
      const parts = key.split('/');
      let currentNode = root;

      parts.forEach((part, index) => {
        if (index < parts.length - 1) {
          // Intermediate parts, process normally
          if (!currentNode.children[part]) {
            currentNode.children[part] = { name: part, value: null, children: {} };
          }
          currentNode = currentNode.children[part];
        } else {
          // Last part, split by commas
          const subParts = part.split(',');
          subParts.forEach((subPart) => {
            if (!currentNode.children[subPart]) {
              currentNode.children[subPart] = { name: subPart, value: null, children: {} };
            }
            // Assign the function to each subPart node
            currentNode.children[subPart].value = value;
          });
        }
      });
      

      // Assign the function to the current node
      currentNode.value = value;
    });

    return root;
  };

  const tree = buildTree(obj);

  // Callback for key click
  const handleKeyClick = (keyPath: string): void => {
    console.log('Key clicked:', keyPath);
  };

  // Callback for badge click
  const handleBadgeClick = (variableName: string): void => {
    console.log('Badge clicked:', variableName);
  };

  // Function to render the function's template string with badges
  const renderFunction = (func: Function): JSX.Element | null => {
    const funcStr = func.toString();
    const templateStringMatch = funcStr.match(/ェ([ØsØS]*?)ェ/);
    if (!templateStringMatch) {
      return null;
    }
    const templateString = templateStringMatch[1];
    const parts = templateString.split(/(Ø§{[^}]+})/g);

    return (
      <div style={{ marginLeft: '20px' }}>
        {parts.map((part, index) => {
          if (part.startsWith('§{') && part.endsWith('}')) {
            const runMatch = part.match(/Ø§{runØ([^)]+,Øs*'([^']+)'Ø)}/);
            if (runMatch) {
              const variableName = runMatch[1];
              return (
                <span
                  key={index}
                  onClick={() => handleBadgeClick(variableName)}
                  style={{
                    border: '1px solid black',
                    padding: '2px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    margin: '0 2px',
                    backgroundColor: '#e0e0e0',
                  }}
                >
                  {variableName}
                </span>
              );
            } else {
              // Handle other template expressions if needed
              return part;
            }
          } else {

            return part;
          }
        })}
      </div>
    );
  };

  // Recursive function to render the tree
  const renderTree = (
    node: TreeNode,
    level: number = 0,
    keyPath: string[] = []
  ): JSX.Element[] => {
    return Object.values(node.children).map((childNode) => {
      const currentKeyPath = [...keyPath, childNode.name];
      return (
        <div key={currentKeyPath.join('/')}>
          <div
            style={{ marginLeft: ェ§{level * 20}pxェ, marginBottom: '5px' }}
          >
            <span
              onClick={() => handleKeyClick(currentKeyPath.join('/'))}
              style={{
                color: 'blue',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              {childNode.name}
            </span>
            {childNode.value && <div>{renderFunction(childNode.value)}</div>}
          </div>
          {renderTree(childNode, level + 1, currentKeyPath)}
        </div>
      );
    });
  };

  return <div>{renderTree(tree)}</div>;
};

export default MyComponent;
`,
'fileContents19': ()=>`
import React, { useState } from "react";
export const WordCreator = ({
    createNewWord
}: {
    createNewWord: (wordName: string) => void;
}) => {
    const [newWordName, setNewWordName] = React.useState<string>("");

  return (
    <>
      <input
        type="text"
        value={newWordName}
        onChange={(e) => setNewWordName(e.target.value)}
      />
      <button onClick={() => createNewWord(newWordName)}>Create Word</button>
    </>
  );
};
`,
'fileContents20': ()=>`
import React from "react";
import {
  BuilderGenerator,
  BuilderTemplate,
  BuilderWord,
  Types,
  useWordBuilder,
} from "../hooks/useWordBuilder";
import { FocusableElements } from "./BuilderAccordion";

import Typography from "@mui/joy/Typography";
import { Card } from "@mui/joy";
import ClearIcon from "@mui/icons-material/Clear";
import DynamicForm from "./DynamicForm";
import { useForm } from "react-hook-form";
import Chip from "@mui/joy/Chip";
import { useHotkeys } from "../hooks/useHotkeys";
import {
  getHotkeyMapForOutputItems,
  hotKeyToItem,
  itemToHotKey,
} from "../util/hotKeyBuilder";

export const WordEditorCard = ({
  name,
  inputs,
  inputSchema,
  outputName,
  hotkeys,
  setFocusedElement,
  idx,
  outputHotkey,
  showOutputHotkey,
  setFocusedStepIdx,
  outputHotkeys,
  removeStepFromWord,
  templatesMeta,
  formObject,
  formKeyPrefix,
  steps,
}: {
  name: string;
  inputs?: Record<string, any>;
  inputSchema: Record<string, Types>;
  outputName?: string;
  hotkeys: Map<string, any>;
  setFocusedElement: (val: FocusableElements) => void;
  idx: number;
  outputHotkey: string;
  showOutputHotkey: boolean;
  setFocusedStepIdx: (idx: number) => void;
  outputHotkeys: Map<string, any>;
  removeStepFromWord: (idx: number) => void;
  templatesMeta: BuilderTemplate[];
  formObject: any; // really, the react-hook-form object
  formKeyPrefix: string;
  steps: BuilderGenerator[];
}) => {
  //  console.log("RENDERING", name, inputs, outputs);
  const registerWithPrefix = (key: string) => {
    return formObject.register(ェ§{formKeyPrefix}.§{key}ェ);
  };
  console.log("FORM OBJECT", formObject);
  // we'll need to parse the input schema to determine what to put in the form
  return (
    <div
      style={{
        border: "1px solid black",
        padding: "10px",
        margin: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
        }}
      >
        <span style={{ cursor: "pointer" }}>
          <ClearIcon fontSize="small" onClick={() => removeStepFromWord(idx)} />
        </span>
        <Typography level="body-xs">{name}</Typography>
      </div>
      <DynamicForm
        schema={inputSchema}
        steps={steps}
        stepIdx={idx}
        hotkeys={hotkeys}
        outputHotkeys={outputHotkeys}
        setFocusedElement={setFocusedElement}
        setFocusedStepIdx={() => setFocusedStepIdx(idx)}
        templatesMeta={templatesMeta}
        formObject={formObject}
        formKeyPrefix={formKeyPrefix}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
        }}
      >
        <Typography level="body-xs">Outputs</Typography>
        <Chip variant="outlined" color="primary" size="sm">
          {outputName} {showOutputHotkey && <>| {outputHotkey}</>}
        </Chip>
      </div>
    </div>
  );
};
export const WordBuilderForm = ({
  stepHotKeys,
  wordsMeta,
  templatesMeta,
  generatorsMeta,
  setFocusedElement,
  setFocusedWord,
  templateHotKeys,
  wordIdx,
  focusedWord,
  isStepHotKeysEnabled,
  isTemplateHotKeysEnabled,
  postMessage
}: {
  stepHotKeys: Map<string, any>;
  wordsMeta: BuilderWord[];
  templatesMeta: BuilderTemplate[];
  generatorsMeta: BuilderGenerator[];
  setFocusedElement: (val: FocusableElements) => void;
  setFocusedWord: (val: number) => void;
  templateHotKeys: Map<string, any>;
  wordIdx: number;
  focusedWord: number;
  isStepHotKeysEnabled: boolean;
  isTemplateHotKeysEnabled: boolean;
  postMessage:any;
}) => {
  const {
    newWord,
    runtimeError,
    addStepToWord,
    updateStepPosition,
    runWord,
    removeStepFromWord,
    submitWord,
  } = useWordBuilder({ wordsMeta, templatesMeta, generatorsMeta, postMessage });
  const isFocused = wordIdx === focusedWord;
  useHotkeys(
    Array.from(stepHotKeys.keys()),
    (event) =>
      addStepToWord(hotKeyToItem(event.key, stepHotKeys), newWord.steps.length),
    { enabled: isFocused && isStepHotKeysEnabled }
  );
  const [focusedStepIdx, setFocusedStepIdx] = React.useState(null);
  function onSubmit(results) {
    console.log("submit", results, "steps", steps);
    submitWord(results);
  }
  const outputTemplateHotkeys = getHotkeyMapForOutputItems(
    newWord.steps,
    focusedStepIdx
  );
  const formObject = useForm();
  const { handleSubmit } = formObject;
  const { steps } = newWord;

  return (
    <div onClick={() => setFocusedWord(wordIdx)}>
      Word Builder
      <form onSubmit={handleSubmit(onSubmit)}>
        <label style={{fontSize: "12px"}}>
          Word name
          <input type="text" {...formObject.register("wordName")} />
        </label>
        <br />
        {steps.map((step, idx) => (
          <WordEditorCard
            {...step}
            steps={steps}
            hotkeys={templateHotKeys}
            setFocusedElement={setFocusedElement}
            idx={idx}
            outputHotkeys={outputTemplateHotkeys}
            outputHotkey={itemToHotKey(step.outputName, outputTemplateHotkeys)}
            showOutputHotkey={
              isTemplateHotKeysEnabled &&
              itemToHotKey(step.outputName, outputTemplateHotkeys) != null
            }
            setFocusedStepIdx={setFocusedStepIdx}
            removeStepFromWord={removeStepFromWord}
            templatesMeta={templatesMeta}
            formObject={formObject}
            formKeyPrefix={step.outputName}
          />
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
`,
'fileContents21': ()=>`
import React, { useEffect, useState } from "react";
import {
  getDescendentsOfKey,
  rs,
  rsCompact,
  tts,
  sortTemplateByDeps,
  genTemplateWithVars,
  argsAndTemplateToFunction,
  multiply,
} from "symmetric-parser";

import { useTemplate, WordStep } from "../hooks/useTemplate";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Template } from "symmetric-parser/dist/src/templator/template-group";
import { useRunner } from "../hooks/useRunner";
import { compact, last } from "lodash";

export type WordDefinition = {
  name: string;
  wordSteps: WordStep[];
  meta?: Record<string, any>;
  subTemplate?: Template;
};

const FAVORITE_GENERATORS = ["orderedParse", "nestedParse"];
const COMMON_CHARS = [
  { name: "comma", value: "," },
  { name: "newline", value: "Øn" },
];
export const TemplateEditors = ({
  templateDefinitions,
  postMessage,
  configPath,
  filledGeneratorsFileText,
  templateModule,
  allFileTemplates,
  runnableWords,
}: {
  templateDefinitions: WordDefinition[];
  postMessage: any;
  configPath: string;
  filledGeneratorsFileText: string;
  templateModule: any;
  allFileTemplates: Template;
  runnableWords: string[];
}) => {
  const {
    generatorModule,
    wordModule,
    addToTemplatePool,
    addToFilledGeneratorPool,
    filledGenerators,
    handleSaveAllFiles,
    addFullTemplateToPool,
  } = useRunner(postMessage, configPath, filledGeneratorsFileText);

  const [stepsForPanel, setStepsForPanel] = useState<
    Record<string, WordStep[]>
  >({});

  return (
    <div>
      <PanelGroup direction="horizontal">
        {templateDefinitions.map((def, i) => {
          const generatorsTemplate = def.meta?.generators ?? {};

          return (
            <>
              <TemplateEditor
                definition={def}
                templateModule={templateModule}
                generatorModule={generatorModule}
                generatorsTemplate={generatorsTemplate}
                wordModule={wordModule}
                setStepsForPanel={setStepsForPanel}
                runnableSteps={filledGenerators}
                addToTemplatePool={addToTemplatePool}
                postMessage={postMessage}
                addToFilledGeneratorPool={addToFilledGeneratorPool}
                isMainEditor={i === 0}
                handleSaveAllFiles={handleSaveAllFiles}
                allFileTemplates={allFileTemplates}
                runnableWords={runnableWords}
                addFullTemplateToPool={addFullTemplateToPool}
              />
            </>
          );
        })}
      </PanelGroup>
      <div>
        {Object.keys(stepsForPanel)?.map((k) => {
          //console.log("steps for panel", stepsForPanel, k, stepsForPanel?.[k]);
          return (
            <div>
              Tree: {k}{" "}
              {stepsForPanel?.[k]?.map((step) => {
                return <div>{step.name}---[result]</div>;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// THAT TEMPLATE BETTER BE SORTED or we could sort it idk
const filterTemplateToKey = (input: Template, rootKey: string) => {
  const family = getDescendentsOfKey(rootKey, input, true);
  const newTemplate = {};
  family.forEach((key) => {
    newTemplate[key] = input[key];
  });
  return sortTemplateByDeps(newTemplate);
};

function getGeneratorSignatureFromKey(
  key: string,
  generatorsTemplate: Template
) {
  for (const v of Object.values(generatorsTemplate)) {
    const str = v();
    if (str.indexOf(key + "(") === 0) {
      return str;
    }
  }
}

export const TemplateEditor = ({
  definition,
  templateModule,
  generatorModule,
  wordModule,
  setStepsForPanel,
  generatorsTemplate,
  runnableSteps,
  addToTemplatePool,
  postMessage,
  addToFilledGeneratorPool,
  isMainEditor,
  handleSaveAllFiles,
  allFileTemplates,
  runnableWords,
  addFullTemplateToPool,
}: {
  definition: WordDefinition;
  templateModule: any;
  generatorModule: any;
  wordModule: any;
  setStepsForPanel: any;
  generatorsTemplate: Template;
  runnableSteps: Template;
  addToTemplatePool: (name: string, template: string, args: string[]) => void;
  postMessage: any;
  addToFilledGeneratorPool: (filledGenerator: Template) => void;
  isMainEditor: boolean;
  handleSaveAllFiles: (template: Template) => void;
  allFileTemplates: Template;
  runnableWords: string[];
  addFullTemplateToPool: (name: string, template: Template) => void;
}) => {
  const {
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
    handleTransition,
  } = useTemplate(
    definition,
    templateModule,
    generatorModule,
    wordModule,
    postMessage,
    isMainEditor
  );
  const {subTemplate} = definition;
  const [insertMode, setInsertMode] = React.useState(false);
  const [insertToKey, setInsertToKey] = React.useState("");

  useEffect(() => {
    setStepsForPanel((prev) => ({ ...prev, [definition.name]: wordSteps }));
  }, [wordSteps]);

  const [filteredTemplates, setFilteredTemplates] = useState(compact([subTemplate??null]));
  useEffect(() => {
    setFilteredTemplates(compact([subTemplate??null]));
  }, [subTemplate]);
  function handleOpenFilter(key: string) {
    const newFilteredTemplates = [
      ...filteredTemplates,
      filterTemplateToKey(template, key),
    ];
    setFilteredTemplates(newFilteredTemplates);
  }
  function handleRemoveKey(key: string) {
    removeKey(key);
  }
  function handleClosePanel(idx: number) {
    const newFilteredTemplates = [...filteredTemplates];
    newFilteredTemplates.splice(idx, 1);
    setFilteredTemplates(newFilteredTemplates);
  }
  function handleRunStep(stepString: string) {
    applyGeneratorString(stepString);
  }
  function handleTemplateClick(templateName: string) {
    const newTemplate = templateModule[templateName] ?? {
      [templateName]: allFileTemplates[templateName],
    };
    if (newTemplate == null) {
      throw new Error(
        "template not found in templateModule or allFileTemplates"
      );
    }
    if (!insertMode) {
      insertTemplateIntoTemplate(newTemplate);
    } else if (insertMode) {
      insertTemplateIntoTemplateAtKey(newTemplate, insertToKey);
    }
  }
  function handleGeneratorClick(generatorName: string) {
    // create the insertion template based off name, finding it in generators string, etc
    const genTempl = genTemplateWithVars(
      {
        step: () => ェ§{generatorName}(template, genArgs)ェ,
      },
      ["genArgs"]
    );
    if (!insertMode) {
      insertTemplateIntoTemplate(genTempl);
    } else if (insertMode) {
      insertTemplateIntoTemplateAtKey(genTempl, insertToKey);
    }
  }
  function handleAddDefinition(key: string, value: string) {
    const funcPart = argsAndTemplateToFunction([], value);
    const newTemplate = { [key]: funcPart };
    if (insertMode) {
      insertTemplateIntoTemplateAtKey(newTemplate, insertToKey);
    } else {
      insertTemplateIntoTemplate(newTemplate);
    }
  }

  function handleAddSkeleton(key: string, value: string, args: string[]) {
    const funcPart = argsAndTemplateToFunction([], value);
    const templ = { [key]: funcPart };
    const newTemplate = genTemplateWithVars(templ, args);
    addToTemplatePool(key, value, args);
    insertTemplateIntoTemplate(newTemplate);
  }

  function handleInsertTemplateName(value: string) {
    const funcPart = argsAndTemplateToFunction([], value);
    insertTemplateIntoTemplateAtKey({ templateName: funcPart }, insertToKey);
  }

  function handleRunnableWordNameClick(key: string) {
    const funcPart = argsAndTemplateToFunction([], key);
    insertTemplateIntoTemplateAtKey({ templateName: funcPart }, insertToKey);
  }

  function handleSaveIsolatedTemplate(name: string, template: Template) {
    addFullTemplateToPool(name, template);
  }

  const templates = [template, ...filteredTemplates];
  return (
    <>
      {templates.map((template, i) => {
        return (
          <>
            <SkeletonPanel
              handleTemplateClick={handleTemplateClick}
              templateModule={templateModule}
              generatorModule={generatorModule}
              handleGeneratorClick={handleGeneratorClick}
              handleAddDefinition={handleAddDefinition}
              handleAddSkeleton={handleAddSkeleton}
              generatorsTemplate={generatorsTemplate}
              runnableSteps={runnableSteps}
              handleRunStep={handleRunStep}
              handleTemplateNameClick={handleInsertTemplateName}
              allFileTemplates={allFileTemplates}
              runnableWords={runnableWords}
              handleRunnableWordClick={handleRunnableWordClick}
              handleRunnableWordNameClick={handleRunnableWordNameClick}
            />
            <Panel
              defaultSize={30}
              minSize={20}
              style={{ overflowX: "scroll" }}
            >
              {isMainEditor && (
                <button onClick={handleTransition}>RUN TRANSITION</button>
              )}
              <h3 style={{ color: "black" }}>{definition.name}</h3>{" "}
              <button
                onClick={() => {
                  handleConvertWordSteps();
                }}
              >
                Convert wordSteps
              </button>
              {i > 0 && (
                <button onClick={() => handleClosePanel(i - 1)}>Close</button>
              )}
              <TemplateTree
                template={template}
                addKeyToNumerator={addKeyToNumerator}
                addKey={addKey}
                handleOpenFilter={handleOpenFilter}
                insertMode={insertMode}
                setInsertMode={setInsertMode}
                insertToKey={insertToKey}
                setInsertToKey={setInsertToKey}
                handleRemoveKey={handleRemoveKey}
                handleSaveAllFiles={handleSaveAllFiles}
                handleSaveIsolatedTemplate={handleSaveIsolatedTemplate}
              />
              <button
                onClick={() =>
                  addToFilledGeneratorPool(
                    multiply(sortTemplateByDeps(template), {})
                  )
                }
              >
                SAVE step1
              </button>
            </Panel>
            <PanelResizeHandle
              style={{ border: "1px solid black", marginRight: "6px" }}
            />
          </>
        );
      })}
    </>
  );
};
export const SkeletonPanel = ({
  templateModule,
  generatorModule,
  handleTemplateClick,
  handleAddDefinition,
  handleAddSkeleton,
  handleGeneratorClick,
  generatorsTemplate,
  runnableSteps,
  handleRunStep,
  handleTemplateNameClick,
  allFileTemplates,
  runnableWords,
  handleRunnableWordClick,
  handleRunnableWordNameClick,
}: {
  templateModule: any;
  generatorModule: any;
  handleTemplateClick: (templateName: string) => void;
  handleAddDefinition: (key: string, value: string) => void;
  handleAddSkeleton: (key: string, value: string, args: string[]) => void;
  handleGeneratorClick: (generatorName: string) => void;
  generatorsTemplate: Template;
  runnableSteps: Template;
  handleRunStep: any;
  handleTemplateNameClick: (key: string) => void;
  allFileTemplates: Template;
  runnableWords: string[];
  handleRunnableWordClick: (key: string) => void;
  handleRunnableWordNameClick: (key: string) => void;
}) => {
  if (templateModule == null) return <div>loading templates...</div>;
  const [defKeyName, setDefKeyName] = useState("");
  const [defValue, setDefValue] = useState("");
  const [lastClickedGenerator, setLastClickedGenerator] = useState("");
  //console.log("WHAT IS TEMPLATE MODULE HERE", templateModule);
  //console.log("is it null?", generatorModule);
  return (
    <Panel defaultSize={20} minSize={20} style={{ overflowX: "scroll" }}>
      <div>
        <input
          value={defKeyName}
          onChange={(e) => setDefKeyName(e.target.value)}
          placeholder="key"
        />
        <input
          value={defValue}
          onChange={(e) => setDefValue(e.target.value)}
          placeholder="value"
        />
        <button
          onClick={() => {
            handleAddDefinition(defKeyName, defValue);
            setDefKeyName("");
            setDefValue("");
          }}
        >
          Add Definition
        </button>
      </div>

      {Object.keys(runnableSteps)?.map((rs) => {
        //console.log("HERE WE ARE WITH RUNNABLE STEPS", rs.toString(), rs);
        const full = runnableSteps[rs]();
        return (
          <div
            style={{
              cursor: "pointer",
              color: "blue",
              textDecoration: "underline",
            }}
            onClick={() => handleRunStep(full)}
          >
            {full}
          </div>
        );
      })}
      <div style={{ color: "black" }}>Runnable Words:</div>
      {runnableWords.map((k) => {
        return (
          <div>
            <span
              style={{
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
              }}
              onClick={() => handleRunnableWordClick(k)}
            >
              {k}
            </span>
            <span
              onClick={() => handleRunnableWordNameClick(k)}
              style={{
                width: "8px",
                height: "8px",
                padding: "0px",
                border: "1px solid black",
                backgroundColor: "#eee",
                color: "black",
                cursor: "pointer",
              }}
            >
              N
            </span>
          </div>
        );
      })}
      <div style={{ color: "black" }}>Common:</div>
      {COMMON_CHARS.map((k) => {
        return (
          <div
            style={{
              cursor: "pointer",
              color: "blue",
              textDecoration: "underline",
            }}
            onClick={() => {
              handleAddDefinition(k.name, k.value);
            }}
          >
            {k.name}
          </div>
        );
      })}

      <div style={{ color: "black" }}>Templates:</div>
      {Object.keys(templateModule)?.map((k) => {
        return (
          <div>
            <span
              style={{
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
              }}
              onClick={() => handleTemplateClick(k)}
            >
              {k}
            </span>
            <span
              onClick={() => handleTemplateNameClick(k)}
              style={{
                width: "8px",
                height: "8px",
                padding: "0px",
                border: "1px solid black",
                backgroundColor: "#eee",
                color: "black",
                cursor: "pointer",
              }}
            >
              N
            </span>
          </div>
        );
      })}

      <div style={{ color: "black" }}>File Templates:</div>
      {Object.keys(allFileTemplates)?.map((k) => {
        return (
          <div>
            <span
              style={{
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
              }}
              onClick={() => handleTemplateClick(k)}
            >
              {k}
            </span>
            <span
              onClick={() => handleTemplateNameClick(k)}
              style={{
                width: "8px",
                height: "8px",
                padding: "0px",
                border: "1px solid black",
                backgroundColor: "#eee",
                color: "black",
                cursor: "pointer",
              }}
            >
              N
            </span>
          </div>
        );
      })}
      <div style={{ color: "black" }}>Generators</div>
      {lastClickedGenerator != null && (
        <div style={{ color: "red", textDecoration: "none" }}>
          {getGeneratorSignatureFromKey(
            lastClickedGenerator,
            generatorsTemplate
          )}
        </div>
      )}
      {FAVORITE_GENERATORS.map((k) => {
        return (
          <div
            style={{
              cursor: "pointer",
              color: "blue",
              textDecoration: "underline",
            }}
            onClick={() => {
              handleGeneratorClick(k);
              setLastClickedGenerator(k);
            }}
          >
            {k}
          </div>
        );
      })}

      {Object.keys(generatorModule)
        ?.sort()
        ?.map((k) => {
          return (
            <div
              style={{
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
              }}
              onClick={() => {
                handleGeneratorClick(k);
                setLastClickedGenerator(k);
              }}
            >
              {k}{" "}
            </div>
          );
        })}
    </Panel>
  );
};
// EXPECTS A SORTED input TEMPLATE
export const TemplateTree = ({
  template,
  addKeyToNumerator,
  addKey,
  handleOpenFilter,
  handleRemoveKey,
  insertMode,
  setInsertMode,
  insertToKey,
  setInsertToKey,
  handleSaveAllFiles,
  handleSaveIsolatedTemplate,
}: {
  addKey: any;
  addKeyToNumerator: any;
  template: Template;
  handleOpenFilter: any;
  handleRemoveKey: any;
  insertMode: boolean;
  setInsertMode: any;
  insertToKey: string;
  setInsertToKey: any;
  handleSaveAllFiles: (template: Template) => void;
  handleSaveIsolatedTemplate: (name: string, template: Template) => void;
}) => {
  const [compiledTemplate, setCompiledTemplate] = React.useState("");
  const [collapsedSet, setCollapsedSet] = React.useState(new Set<string>());
  const [hiddenSet, setHiddenSet] = React.useState(new Set<string>());
  const indentHash = new Map<string, number>();

  function handleRsClick(arg: string) {
    addKey(arg);
  }
  const handleNumeratorClick = (numerator: string) => {
    if (insertMode) {
      if (numerator !== insertToKey) {
        addKeyToNumerator(numerator, insertToKey);
      } else {
        setInsertMode(false);
        setInsertToKey("");
      }
    } else {
      setInsertMode(true);
      setInsertToKey(numerator);
    }
  };
  //console.log("TEMPLATE", template);
  const handleCompile = () => {
    setCompiledTemplate(tts(template));
  };

  const handleCollapse = (key: string) => {
    const allChildren = getDescendentsOfKey(key, template, false);
    const newCollapsedSet = new Set(collapsedSet);
    const newHiddenSet = new Set(hiddenSet);
    if (collapsedSet.has(key)) {
      newCollapsedSet.delete(key);
      allChildren.forEach((child) => {
        newHiddenSet.delete(child);
      });
    } else {
      newCollapsedSet.add(key);
      allChildren.forEach((child) => {
        newHiddenSet.add(child);
      });
    }

    setHiddenSet(newHiddenSet);
    setCollapsedSet(newCollapsedSet);
  };
  function handleSaveTemplate(name: string) {
    handleSaveIsolatedTemplate(name, template);
  }
  //console.log("TEMPLATE TREE TEMPLATE", template)
  return (
    <div>
      <button onClick={() => handleSaveAllFiles(template)}>
        Save All Files
      </button>
      <div>
        <IsolatedTemplateSaver handleSave={handleSaveTemplate} />
      </div>
      {Object.keys(template)?.map((k, i) => {
        const denoms = k.split("/")[1]?.split(",");

        const numerator = k.split("/")[0];
        const indentionMultiplier = indentHash.get(numerator) ?? 0;
        denoms?.forEach((d) => {
          indentHash.set(d, indentionMultiplier + 1);
        });

        const peekTreeNodes = denoms?.map((d) => {
          if (template[d] != null) {
            // we have a non-denom key, need to display and extra TreeNode while giving it the proper indentation
            return (
              <TreeNode
                tKey={d}
                indentionMultiplier={indentionMultiplier + 1}
                insertMode={insertMode}
                insertToKey={insertToKey}
                hiddenSet={hiddenSet}
                handleCollapse={handleCollapse}
                handleNumeratorClick={handleNumeratorClick}
                collapsedSet={collapsedSet}
                template={template}
                handleRsClick={handleRsClick}
                denoms={denoms}
                handleOpenFilter={handleOpenFilter}
                handleRemoveKey={handleRemoveKey}
              />
            );
          } else {
            return null;
          }
        });

        return (
          <>
            <TreeNode
              tKey={k}
              indentionMultiplier={indentionMultiplier}
              insertMode={insertMode}
              insertToKey={insertToKey}
              hiddenSet={hiddenSet}
              handleCollapse={handleCollapse}
              handleNumeratorClick={handleNumeratorClick}
              collapsedSet={collapsedSet}
              template={template}
              handleRsClick={handleRsClick}
              denoms={denoms}
              handleOpenFilter={handleOpenFilter}
              handleRemoveKey={handleRemoveKey}
            />
            {peekTreeNodes?.map((node) => node)}
          </>
        );
      })}

      <button onClick={handleCompile}>Compile</button>
      {compiledTemplate !== "" && (
        <pre style={{ color: "black", fontSize: "12px" }}>
          {compiledTemplate}
        </pre>
      )}
    </div>
  );
};
const IsolatedTemplateSaver = ({
  handleSave,
}: {
  handleSave: (name: string) => void;
}) => {
  const [name, setName] = useState("");
  return (
    <>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Isolated Template Name"
      ></input>
      <button onClick={() => handleSave(name)}>Save Templ</button>
    </>
  );
};
const TreeNode = ({
  tKey,
  insertMode,
  hiddenSet,
  handleCollapse,
  insertToKey,
  handleNumeratorClick,
  collapsedSet,
  template,
  handleRsClick,
  denoms,
  indentionMultiplier,
  handleOpenFilter,
  handleRemoveKey,
}) => {
  const numerator = tKey.split("/")[0];

  const clickableNumeratorColor = insertMode ? "blue" : "green";
  return (
    <div
      style={{
        marginLeft: ェ§{denoms != null ? indentionMultiplier * 15 : 0}pxェ,
        display: hiddenSet.has(tKey) ? "none" : "block",
      }}
    >
      <button onClick={() => handleCollapse(tKey)}>C</button>
      <span
        style={{
          color: insertToKey === numerator ? "black" : clickableNumeratorColor,
          textDecoration: insertToKey === numerator ? "" : "underline",
          cursor: "pointer",
        }}
        onClick={() => handleNumeratorClick(numerator)}
      >
        {numerator}
      </span>
      <button onClick={() => handleOpenFilter(tKey)}>I</button>
      <button
        style={{ marginLeft: "14px" }}
        onClick={() => handleRemoveKey(tKey)}
      >
        R
      </button>

      {collapsedSet.has(tKey) ? (
        <span
          onClick={() => handleCollapse(tKey)}
          style={{
            cursor: "pointer",
            color: "blue",
            textDecoration: "underline",
            marginLeft: "3px",
          }}
        >
          . . .
        </span>
      ) : (
        renderPart(template[tKey].toString(), handleRsClick)
      )}
    </div>
  );
};

function nakedPartToString(part: string) {
  if (part.includes("ェ")) {
    return part.substring(part.indexOf("ェ") + 1, part.lastIndexOf("ェ"));
  } else {
    return part.substring(part.indexOf('"') + 1, part.lastIndexOf('"'));
  }
}

function rsToArg(rs: string) {
  //    return ェØ§{run(§{v},'§{v}')}ェ;
  return rs.substring(rs.indexOf("(") + 1, rs.indexOf(","));
}
function renderPart(part: string, handleRsClick: (arg: string) => void) {
  const args = part
    .substring(part.indexOf("{") + 1, part.indexOf("}"))
    .split(",")
    .map((arg) => arg.trim());
  const compactRs = args.map((arg) => rsCompact(arg));
  const nonCompactRs = args.map((arg) => rs(arg));
  const doubleQuotedCompactRs = compactRs.map((crs) =>
    crs.replaceAll("'", '"')
  );
  const doubleQuotedNonCompactRs = nonCompactRs.map((ncrs) =>
    ncrs.replaceAll("'", '"')
  );
  const allRs = [
    ...compactRs,
    ...nonCompactRs,
    ...doubleQuotedCompactRs,
    ...doubleQuotedNonCompactRs,
  ];
  let funcPart = part.substring(part.indexOf("ェ") + 1, part.lastIndexOf("ェ"));
  const parts = funcPart.split(/(Ø§{[^}]+})/g);
  if (parts.length === 1) {
    return (
      <div style={{ color: "red", padding: "0px 5px" }}>
        {nakedPartToString(part)}
      </div>
    );
  }
  let finalParts = [];
  parts.forEach((part, index) => {
    if (allRs.includes(part)) {
      const arg = rsToArg(part);
      finalParts.push(
        <span
          style={{
            color: "purple",
            cursor: "pointer",
            margin: "0px 2px",
            border: "1px solid black",
            backgroundColor: "#eee",
            padding: "0px 2px",
          }}
          onClick={() => handleRsClick(arg)}
        >
          {arg}
        </span>
      );
    } else {
      finalParts.push(part);
    }
  });
  return <div style={{ color: "red", padding: "0px 5px" }}>{finalParts}</div>;
}
`,
'fileContents22': ()=>`
import React from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import {Item} from './Item';

export function SortableItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: props.id});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Item ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
    </Item>
  );
}`,
'fileContents23': ()=>`
import * as React from "react";
import { useQueueListener } from "../hooks/useQueueListener";

import { css } from "@emotion/css";

const currentStepStyle = {
  color: "red",
};
const upcomingStepStyle = {
  color: "blue",
};
const descriptionStyle = {
  color: "black",
  marginLeft: "10px",
};

const baseStyle = cssェ
  overflow: hidden;
  max-height: 17px;
  &:hover {
max-height: 200px;
  }
ェ;
export const QueueHeader = ({}) => {
  const { queueSteps } = useQueueListener();
  const currentStep = queueSteps[0];
  return (
    <div className={baseStyle}>
      {queueSteps.map((step, i) => {
        const style = i === 0 ? currentStepStyle : upcomingStepStyle;
        const bridge = i !== queueSteps.length - 1 ? ェ-->ェ : "";
        return (
          <span style={style}>
            {step.name}
            {bridge}
          </span>
        );
      })}
      <span style={descriptionStyle}>
        Current step: {currentStep.description}
      </span>
      <div>Next action: {currentStep.transitionAction}</div>
    </div>
  );
};
`,
'fileContents24': ()=>`
import React, {forwardRef} from 'react';

export const Item = forwardRef(({id, ...props}: any, ref) => {
  return (
    <div {...props} ref={ref}>{props.children}</div>
  )
});`,
'fileContents25': ()=>`
import React, { useState } from "react";
import AceEditor from "react-ace";

export const GTWVEditor = ({ handleSubmit }) => {
  const [value, setValue] = useState("");
  const [args, setArgs] = useState("");
  const [key, setKey] = useState("");
  function onChange(newValue) {
    setValue(newValue);
  }
  return (
    <div>
      <input
        type="text"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="key"
      />
      <AceEditor
        mode="javascript"
        theme="github"
        onChange={onChange}
        name="UNIQUE_ID_OF_DIV"
        value={value}
        height="100px"
        width="500px"
      />
      <input
        type="text"
        value={args}
        onChange={(e) => setArgs(e.target.value)}
        placeholder="args"
      />
      <button disabled={key==null||key==""||value==null||value==""||args==null||args==""} onClick={() => handleSubmit({ value, args: args.split(",").map(a=>a.trim()), key })}>Submit</button>
    </div>
  );
};
`,
'fileContents26': ()=>`
import * as React from "react";
import { Types } from "../hooks/useWordBuilder";

// The function that takes a schema and outputs a form component
export function createForm(inputSchema) {
  return function DynamicForm({ onSubmit, hotkeys, setFocusedElement }) {
    const [formState, setFormState] = React.useState(() => {
      const initialState = {};
      for (const key in inputSchema) {
        if (
          inputSchema[key] === Types.Template ||
          inputSchema[key] === Types.String
        ) {
          initialState[key] = "";
        } else if (inputSchema[key] === Types.Object) {
          initialState[key] = {};
        }
      }
      return initialState;
    });

    const handleChange = (key, value) => {
      setFormState((prevState) => ({
        ...prevState,
        [key]: value,
      }));
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      console.log("Form submitted:", formState);
      onSubmit(formState);
    };

    return (
      <form onSubmit={handleSubmit}>
        {Object.keys(inputSchema).map((key) => {
          if (
            inputSchema[key] === Types.Template ||
            inputSchema[key] === Types.String
          ) {
            return (
              <div key={key}>
                <label>{key}</label>
                <input
                  type="text"
                  value={formState[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            );
          } else if (inputSchema[key] === Types.Object) {
            // Assuming nested objects would require more complex handling
            return (
              <div key={key}>
                <label>{key} (Object)</label>
                <textarea
                  value={JSON.stringify(formState[key], null, 2)}
                  onChange={(e) =>
                    handleChange(key, JSON.parse(e.target.value))
                  }
                />
              </div>
            );
          }
          return null;
        })}
        <button type="submit">Submit</button>
      </form>
    );
  };
}
`,
'fileContents27': ()=>`
import * as React from "react";
import { Controller, set, useFieldArray, useForm } from "react-hook-form";
import { BuilderGenerator, BuilderTemplate, Schema, Types } from "../hooks/useWordBuilder";
import { useHotkeys } from "../hooks/useHotkeys";
import { hotKeyToItem } from "../util/hotKeyBuilder";
import { Box, Chip, ChipDelete, Sheet } from "@mui/joy";
import { FocusableElements } from "./BuilderAccordion";
import { compact, isObject } from "lodash";
import { arrayMove } from "@dnd-kit/sortable";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableItem } from "./SortableItem";
import { Template } from "symmetric-parser/dist/src/templator/template-group";

interface FormProps {
  schema: Schema;
  hotkeys: Map<string, any>;
  setFocusedElement: (element: FocusableElements) => void;
  setFocusedStepIdx: () => void;
  outputHotkeys: Map<string, any>;
  templatesMeta: BuilderTemplate[];
  formObject: any;
  formKeyPrefix: string;
  steps:BuilderGenerator[];
  stepIdx: number;
}

const NestedFormFields = ({
  register,
  unregister,
  control,
  schema,
  hotkeys,
  hotkeyEnabledIndex,
  setHotkeyEnabledIndex,
  setValue,
  getValues,
  setFocusedElement,
  setFocusedStepIdx,
  outputHotkeys,
  keyPrefix = null,
  arrayFields,
  setArrayFields,
  nestIndex,
  templatesMeta,
  keyWithPrefix,
  steps,
  stepIdx
}: {
  register: any;
  unregister: any;
  control: any;
  schema: Schema;
  hotkeys: Map<string, any>;
  hotkeyEnabledIndex: number;
  setHotkeyEnabledIndex: (index: number) => void;
  setValue: any;
  getValues: any;
  setFocusedElement: (element: FocusableElements) => void;
  setFocusedStepIdx: (index: number) => void;
  outputHotkeys: Map<string, any>;
  keyPrefix: string | null;
  arrayFields: Record<string, number>;
  setArrayFields: (fields: Record<string, number>) => void;
  nestIndex?: number;
  templatesMeta: BuilderTemplate[];
  keyWithPrefix: (key: string) => string;
  steps: BuilderGenerator[],
  stepIdx: number;
}) => {
  //console.count("generateFormFields");
  if (schema == null) return null;
  //console.log("THE SCHEMA", schema);
  const [arrayCount, setArrayCount] = React.useState({});
  const components = Object.keys(schema).map((schemaKey, i) => {
    let key = schemaKey;
    //console.log("doing key", key);
    //console.log("and schema at key...", schema[key]);
    if (Array.isArray(schema[key])) {
      // RECURSE!!
      //console.log("IS ARRAY!!!", schema[key]);
      // we must have an array field here, so can add multiple.
      // but, we add multiple of the schema inside it, which can also have an array of objects.
      const nestedSchema: Schema = schema[key][0] as Schema;

      // we need the key to say "key.0.subKey", ex "mappings.0.from", "mappings.0.to", etc.
      // while also being able to add to it....

      const fullKey = keyPrefix != null ? ェ§{keyPrefix}.§{key}ェ : key;

      if (arrayCount[fullKey] == null) {
        setArrayCount({ ...arrayCount, [fullKey]: 1 });
      }

      const nestedFormFields = [];
      for (let i = 0; i < (arrayCount[fullKey] ?? 1); i++) {
        const nestedKeyPrefix =
          keyPrefix != null ? ェ§{fullKey}.§{i}ェ : ェ§{fullKey}.§{i}ェ;
        nestedFormFields.push(
          <div>
            {i}:
            {i === arrayCount[fullKey] - 1 && (
              <button
                onClick={() => {
                  setArrayCount({
                    ...arrayCount,
                    [fullKey]: arrayCount[fullKey] - 1,
                  });
                  unregister(keyWithPrefix(nestedKeyPrefix));
                }}
              >
                Remove
              </button>
            )}
            <NestedFormFields
              register={register}
              unregister={unregister}
              control={control}
              schema={nestedSchema}
              hotkeys={hotkeys}
              hotkeyEnabledIndex={hotkeyEnabledIndex}
              setHotkeyEnabledIndex={setHotkeyEnabledIndex}
              setValue={setValue}
              getValues={getValues}
              setFocusedElement={setFocusedElement}
              setFocusedStepIdx={setFocusedStepIdx}
              outputHotkeys={outputHotkeys}
              keyPrefix={nestedKeyPrefix}
              arrayFields={arrayFields}
              setArrayFields={setArrayFields}
              templatesMeta={templatesMeta}
              keyWithPrefix={keyWithPrefix}
              steps={steps}
              stepIdx={stepIdx}
            />
          </div>
        );
      }
      // we need the key to say "key.0.subKey", ex "mappings.0.from", "mappings.0.to", etc.

      return (
        <div>
          <button
            onClick={() => {
              // add to the array count
              setArrayCount({
                ...arrayCount,
                [fullKey]: arrayCount[fullKey] + 1,
              });
            }}
          >
            Add
          </button>
          {nestedFormFields}
        </div>
      );
    }
    if (!Array.isArray(schema[key]) && isObject(schema[key])) {
      //console.log("IS OBJECT!!!", schema[key]);
      // if it's an object, then the object is another schema.
      // nest, and call generateFormFields again.
      const nestedSchema: Schema = schema[key] as Schema;
      const nestedFormFields = (
        <NestedFormFields
          register={register}
          unregister={unregister}
          control={control}
          schema={nestedSchema}
          hotkeys={hotkeys}
          hotkeyEnabledIndex={hotkeyEnabledIndex}
          setHotkeyEnabledIndex={setHotkeyEnabledIndex}
          setValue={setValue}
          getValues={getValues}
          setFocusedElement={setFocusedElement}
          setFocusedStepIdx={setFocusedStepIdx}
          outputHotkeys={outputHotkeys}
          keyPrefix={null}
          arrayFields={arrayFields}
          setArrayFields={setArrayFields}
          templatesMeta={templatesMeta}
          keyWithPrefix={keyWithPrefix}
          steps={steps}
          stepIdx={stepIdx}
        />
      );
      return <div key={key}>{nestedFormFields}</div>;
    }

    const schemaValue = schema[key];
    // sneaky use of let, bad!
    key = keyPrefix ? ェ§{keyPrefix}.§{key}ェ : key;

    switch (schemaValue) {
      case Types.String:
        return (
          <div key={key}>
            <label>{key}</label>
            <input {...register(keyWithPrefix(key))} />
          </div>
        );
      case Types.Number:
        return (
          <div key={key}>
            <label>{key}</label>
            <input {...register(keyWithPrefix(key))} />
          </div>
        );
      case Types.Template:
        return (
          <div key={keyWithPrefix(key)}>
            <SingleTemplatefield
              name={keyWithPrefix(key)}
              control={control}
              hotkeys={hotkeys}
              outputHotkeys={outputHotkeys}
              idx={i}
              isHotkeyEnabled={hotkeyEnabledIndex === i}
              setIsHotkeyEnabled={setHotkeyEnabledIndex}
              setValue={setValue}
              setFocusedElement={setFocusedElement}
              setFocusedStepIdx={setFocusedStepIdx}
              templatesMeta={templatesMeta}
              steps={steps}
              stepIdx={stepIdx}
            />
          </div>
        );
      case Types.TemplateArray:
        return (
          <div key={keyWithPrefix(key)}>
            <DynamicTemplatesField
              name={keyWithPrefix(key)}
              control={control}
              hotkeys={hotkeys}
              outputHotkeys={outputHotkeys}
              idx={i}
              isHotkeyEnabled={hotkeyEnabledIndex === i}
              setIsHotkeyEnabled={setHotkeyEnabledIndex}
              setValue={setValue}
              getValues={getValues}
              setFocusedElement={setFocusedElement}
              setFocusedStepIdx={setFocusedStepIdx}
              templatesMeta={templatesMeta}
            />
          </div>
        );
      default:
        return null;
    }
  });

  return (
    <Box fontSize={12} p={1} m={1} sx={{ border: "1px solid grey" }}>
      {components}
    </Box>
  );
};
const SingleTemplatefield = ({
  name,
  control,
  hotkeys,
  idx,
  isHotkeyEnabled,
  setIsHotkeyEnabled,
  setValue,
  setFocusedElement,
  setFocusedStepIdx,
  outputHotkeys,
  templatesMeta,
  steps,
  stepIdx
}) => {
  console.log("single templ field name", name, idx)
  React.useEffect(() => {
    if(name.split(".").some(n=>n==="input")) {
      const priorStepOutput = steps[stepIdx-1]?.outputName ?? "wordInput";
      console.log("did we nail it?", priorStepOutput, steps, steps[stepIdx-1])
      setValue(name, priorStepOutput)
    }
  },[])
  useHotkeys(
    Array.from(hotkeys.keys()),
    (event) => {
      console.log("ITEM FROM HOTKEY31", hotKeyToItem(event.key, hotkeys));
      setValue(name, (hotKeyToItem(event.key, hotkeys) as Template).name);
    },
    { enabled: isHotkeyEnabled }
  );
  useHotkeys(
    Array.from(outputHotkeys.keys()),
    (event) => {
      console.log("ITEM FROM HOTKEY4",hotKeyToItem(event.key, outputHotkeys))
      // stored as a string, so we need to make it a "Template" with a name
      setValue(name, hotKeyToItem(event.key, outputHotkeys));
    },
    { enabled: isHotkeyEnabled }
  );
  return (
    <div
      key={idx}
      onClick={(e) => {
        setFocusedElement(FocusableElements.templateInput);
        setIsHotkeyEnabled(idx);
        // idx provided by parent, we don't call it here
        setFocusedStepIdx();
        e.stopPropagation();
      }}
      onFocus={() => {
        setFocusedElement(FocusableElements.templateInput);
        setIsHotkeyEnabled(idx);
        setFocusedStepIdx();
      }}
      onBlur={() => {
        setFocusedElement(FocusableElements.builder);
        setFocusedStepIdx(null);
        setIsHotkeyEnabled(null);
      }}
      tabIndex={idx}
    >
      <label>{name}</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          return (
            <div>
              <Sheet
                variant="outlined"
                color="neutral"
                sx={{ width: 1, minHeight: 30 }}
              >
                {field.value != null && (
                  <Chip
                    size="sm"
                    variant="outlined"
                    endDecorator={
                      <ChipDelete
                        onDelete={() => {
                          setValue(name, null);
                        }}
                      />
                    }
                  >
                    {field.value}:
                    {templatesMeta
                      .find((t) => t?.name === field.value)
                      ?.vars?.join(", ")}
                  </Chip>
                )}
              </Sheet>
            </div>
          );
        }}
      />
    </div>
  );
};

const DynamicTemplatesField = ({
  name,
  control,
  hotkeys,
  isHotkeyEnabled,
  setIsHotkeyEnabled,
  idx,
  setValue,
  getValues,
  setFocusedElement,
  setFocusedStepIdx,
  outputHotkeys,
  templatesMeta,
}) => {
  useHotkeys(
    Array.from(hotkeys.keys()),
    (event) => {
      const currentValues = getValues(name) ?? [];
      console.log("ITEM FROM HOTKEY1", hotKeyToItem(event.key, hotkeys));
      setValue(
        name,
        compact([
          ...currentValues,
          (hotKeyToItem(event.key, hotkeys) as Template).name,
        ])
      );
    },
    { enabled: isHotkeyEnabled }
  );
  useHotkeys(
    Array.from(outputHotkeys.keys()),
    (event) => {
      const currentValues = getValues(name) ?? [];
      console.log("ITEM FROM HOTKEY",hotKeyToItem(event.key, outputHotkeys))
      setValue(
        name,
        compact([
          ...currentValues,
          hotKeyToItem(event.key, outputHotkeys),
        ])
      );
    },
    { enabled: isHotkeyEnabled }
  );
  const [focusedIdx, setFocusedIdx] = React.useState(null);

  return (
    <div
      key={idx}
      onClick={(e) => {
        setFocusedElement(FocusableElements.templateInput);
        setIsHotkeyEnabled(idx);
        setFocusedStepIdx(idx);
        e.stopPropagation();
      }}
      onFocus={() => {
        setFocusedElement(FocusableElements.templateInput);
        setIsHotkeyEnabled(idx);
        setFocusedStepIdx(idx);
      }}
      onBlur={() => {
        setIsHotkeyEnabled(null);
        setFocusedElement(FocusableElements.builder);
        setFocusedIdx(null);
        setFocusedStepIdx(null);
      }}
      tabIndex={idx}
    >
      <label>{name}</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          // use the hot keys, it will swap the focused index
          // finish by setting the new focusedIdx to the new idx it's in.
          useHotkeys(
            ["arrowLeft", "arrowRight"],
            (event) => {
              const newIdx =
                event.key === "ArrowLeft" ? focusedIdx - 1 : focusedIdx + 1;
              if (newIdx < 0 || newIdx >= field.value.length) {
                return;
              }
              const newValues = arrayMove(field.value, focusedIdx, newIdx);
              setValue(name, newValues);
              setFocusedIdx(newIdx);
            },
            { enabled: focusedIdx !== null }
          );
          return (
            <div>
              <Sheet
                variant="outlined"
                color="neutral"
                sx={{ width: 1, minHeight: 30 }}
              >
                {field.value?.map((item, i) => (
                  <Chip
                    size="sm"
                    variant="outlined"
                    onClick={() => {
                      setFocusedIdx(i);
                    }}
                    color={focusedIdx === i ? "primary" : "neutral"}
                    endDecorator={
                      <ChipDelete
                        onDelete={() => {
                          const newValues = getValues(name).filter(
                            (_, i2) => i2 !== i
                          );
                          setValue(name, newValues);
                          setFocusedIdx(null);
                        }}
                      />
                    }
                  >
                    {item}:{" "}
                    {templatesMeta
                      .find((t) => t?.name === item)
                      ?.vars?.join(", ")}
                  </Chip>
                ))}
              </Sheet>
            </div>
          );
        }}
      />
    </div>
  );
};

const DynamicForm: React.FC<FormProps> = ({
  schema,
  hotkeys,
  setFocusedElement,
  setFocusedStepIdx,
  outputHotkeys,
  templatesMeta,
  formObject,
  formKeyPrefix,
  steps,
  stepIdx,
}) => {
  const { control, setValue, getValues, unregister, register } = formObject;
  const [hotkeyEnabledIndex, setHotkeyEnabledIndex] = React.useState(null);
  const [arrayFields, setArrayFields] = React.useState({});

  function keyWithPrefix(key: string) {
    return ェ§{formKeyPrefix}.§{key}ェ;
  }

  return (
    <div
      onClick={() => {
        setHotkeyEnabledIndex(null);
        setFocusedElement(FocusableElements.builder);
      }}
    >
      <NestedFormFields
      steps={steps}
      stepIdx={stepIdx}
        register={register}
        unregister={unregister}
        control={control}
        schema={schema}
        hotkeys={hotkeys}
        hotkeyEnabledIndex={hotkeyEnabledIndex}
        setHotkeyEnabledIndex={setHotkeyEnabledIndex}
        setValue={setValue}
        getValues={getValues}
        setFocusedElement={setFocusedElement}
        setFocusedStepIdx={setFocusedStepIdx}
        outputHotkeys={outputHotkeys}
        keyPrefix={null}
        arrayFields={arrayFields}
        setArrayFields={setArrayFields}
        templatesMeta={templatesMeta}
        keyWithPrefix={keyWithPrefix}
      />
    </div>
  );
};

export default DynamicForm;
`,
'fileContents28': ()=>`
import React from "react";
export default function Dropdown({ options, onSelect, placeholder="Select an option" }) {
    const handleChange = (event) => {
      onSelect(event.target.value);
    };
  
    return (
      <select onChange={handleChange}>
        <option value="" disabled selected>
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }`,
'fileContents29': ()=>`
import * as React from "react";
import Tooltip from "@mui/joy/Tooltip";
import Chip from "@mui/joy/Chip";
import { Template } from "symmetric-parser/dist/src/templator/template-group";
import { Sheet } from "@mui/joy";
import {
  BuilderGenerator
} from "../hooks/useWordBuilder";
import {
  itemToHotKey,
  getHotKeyMapForItems
} from "../util/hotKeyBuilder";
import { useMeta } from "../hooks/useMeta";
import { WordBuilderForm } from "./WordBuilderForm";

function identity(t: Template): Template {
  return t;
}
function combine(t1: Template, t2: Template): Template {
  return { ...t1, ...t2 };
}

type TemplateMeta = {
  name: string;
  templateBody: string;
  hotkey: string;
  showHotkey: boolean;
  vars: string[];
};

const TemplateNode = ({
  name,
  templateBody,
  vars,
  hotkey,
  showHotkey,
}: TemplateMeta) => {
  return (
    <Tooltip title={templateBody}>
      <Chip variant="outlined">
        {name}: {vars?.join(", ")} {showHotkey && <>| {hotkey}</>}
      </Chip>
    </Tooltip>
  );
};
type GeneratorMeta = {
  name: string;
  hotkey: string;
  showHotkey: boolean;
};

const GeneratorNode = ({ name, hotkey, showHotkey }: GeneratorMeta) => {
  return (
    <Tooltip title={name}>
      <Chip variant="outlined">
        {name} {showHotkey && <>| {hotkey}</>}
      </Chip>
    </Tooltip>
  );
};

type WordMeta = {
  name: string;
  steps: BuilderGenerator[];
  hotkey: string;
  showHotkey: boolean;
};

const WordNode = ({ name, steps, hotkey, showHotkey }: WordMeta) => {
  const text = steps.toString();
  return (
    <Tooltip title={text}>
      <Chip variant="outlined">
        {name} {showHotkey && <>| {hotkey}</>}
      </Chip>
    </Tooltip>
  );
};

//  console.log("RENDERING", name, inputs, outputs);
function handleSubmit(results) {
  console.log("submit", results);
}

export enum FocusableElements {
  builder,
  templateInput,
  none,
}

const BuilderAccordion = ({
  generatorsFileText,
  templatesFileText,
  wordsFileText,
  postMessage,
}: {
  generatorsFileText: string;
  templatesFileText: string;
  wordsFileText: string;
  postMessage:any;
}) => {
  if (
    generatorsFileText == null ||
    templatesFileText == null ||
    wordsFileText == null
  ) {
    return <div>Loading...</div>;
  }
  const { wordsMeta, templatesMeta, generatorsMeta } = useMeta({
    wordsFileText,
    templatesFileText,
    generatorsFileText,
  });

  const [focusedElement, setFocusedElement] = React.useState<FocusableElements>(
    FocusableElements.builder
  );

  const templateHotKeys = getHotKeyMapForItems(templatesMeta);
  const stepHotKeys = getHotKeyMapForItems([...generatorsMeta, ...wordsMeta]);

  const isStepHotKeysEnabled = focusedElement === FocusableElements.builder;
  const isTemplateHotKeysEnabled =
    focusedElement === FocusableElements.templateInput;

  console.log("what is focused?", focusedElement);
  const [focusedWord, setFocusedWord] = React.useState(0);
  // have a useEffect check that the form properly sets the input template value based on what is in step.
  // that's odd though...there has to be a better way
  return (
    <div>
      <Sheet variant="outlined" color="neutral">
        Words
        {wordsMeta.map((w) => (
          <WordNode
            name={w.name}
            steps={w.steps}
            hotkey={itemToHotKey(w, stepHotKeys)}
            showHotkey={isStepHotKeysEnabled}
          />
        ))}
        <hr />
        Generators
        {generatorsMeta.map((g) => (
          <GeneratorNode
            name={g.name}
            hotkey={itemToHotKey(g, stepHotKeys)}
            showHotkey={isStepHotKeysEnabled}
          />
        ))}
        <hr />
        Template Pool
        {templatesMeta.map((t) => (
          <TemplateNode
            name={t.name}
            templateBody={t.templateBody}
            vars={t.vars}
            hotkey={itemToHotKey(t, templateHotKeys)}
            showHotkey={isTemplateHotKeysEnabled}
          />
        ))}
        <hr />
        <WordBuilderForm
          stepHotKeys={stepHotKeys}
          wordsMeta={wordsMeta}
          templatesMeta={templatesMeta}
          generatorsMeta={generatorsMeta}
          setFocusedElement={setFocusedElement}
          wordIdx={0}
          templateHotKeys={templateHotKeys}
          setFocusedWord={setFocusedWord}
          focusedWord={focusedWord}
          isStepHotKeysEnabled={isStepHotKeysEnabled}
          isTemplateHotKeysEnabled={isTemplateHotKeysEnabled}
          postMessage={postMessage}
        />
        <WordBuilderForm
          stepHotKeys={stepHotKeys}
          wordsMeta={wordsMeta}
          templatesMeta={templatesMeta}
          generatorsMeta={generatorsMeta}
          setFocusedElement={setFocusedElement}
          wordIdx={1}
          templateHotKeys={templateHotKeys}
          setFocusedWord={setFocusedWord}
          focusedWord={focusedWord}
          isStepHotKeysEnabled={isStepHotKeysEnabled}
          isTemplateHotKeysEnabled={isTemplateHotKeysEnabled}
          postMessage={postMessage}
        />
      </Sheet>
    </div>
  );
};

export default BuilderAccordion;
`,
'fileContents30': ()=>`
import * as React from "react";
import { Template } from "symmetric-parser/dist/src/templator/template-group";
import BuilderAccordion from "./BuilderAccordion";
import { CssVarsProvider } from "@mui/joy";
import { useFileSystem } from "../hooks/useFileSystem";
import TemplateDirect from "./v2";
import { TemplateEditors, TemplateTree } from "./TemplateTree";
import { useRunner } from "../hooks/useRunner";
import { tts } from "symmetric-parser";
import { buildAllGeneratorsTemplate } from "../util/parsers/parseGenerators";
import { WordStep } from "../hooks/useTemplate";
import { last } from "lodash";
import Dropdown from "./Dropdown";
import { WordCreator } from "./WordCreator";
import { GTWVEditor } from "./GTWVEditor";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import { QueueHeader } from "./QueueHeader";

export function Ò(func: () => string, keyName: string) {
  try {
    if (func == null) {
      return "§{run(" + keyName + ", '" + keyName + "')}";
    }
    if (typeof func === "string") {
      throw new Error("func is string");
    }
    const result = func();
    return result;
  } catch (e) {
    return "§{run(" + keyName + ", '" + keyName + "')}";
  }
}
interface vscode {
  postMessage(message: any): void;
}
declare const vscode: vscode;

const sendMessage = () => {
  console.log("button clicked");
  vscode.postMessage({ command: "testing" });
};

const firsty: Template = {
  firsty: () => ェthis is where we do itェ,
};

const playTemplate = ェ({ 
    'shop1/would1,test1': ({would1, test1})=>Øェhow Ø§{run(would1, 'would1')} you Ø§{run(test1, 'test1')} this tooØェ, 
    'shop2/would2,test2': ({would2, test2})=>Øェhow Ø§{run(would2, 'would2')} you Ø§{run(test2, 'test2')} this tooØェ, 
    'shop3/would3,test3': ({would3, test3})=>Øェhow Ø§{run(would3, 'would3')} you Ø§{run(test3, 'test3')} this tooØェ, 
    'something1': ()=>Øェsome valueØェ, 
    'something2': ()=>Øェanother one!Øェ 
  })ェ;

export const CONFIG_PATH =
  "/Users/jaykoontz/Documents/GitHub/symmetric-blueprints/.spconfig";
const App = () => {
  const {
    readAllFiles,
    generatorsFileText,
    templatesFileText,
    loading,
    filledGeneratorsFileText,
    wordNames,
    currentWord,
    currentWordName,
    setWord,
    createNewWord,
    addToTemplatePool,
    templateModule,
    allFileTemplates,
    runnableWords,
    selectQueue,
    queueNames,
    subTemplate
  } = useFileSystem(vscode.postMessage);
  React.useEffect(() => {
    readAllFiles("polTest");
  }, []);
  const [showGTWVEditor, setShowGTWVEditor] = React.useState(false);
  return (
    <div>
      <div><QueueHeader/></div>
      <CssVarsProvider>
        <Dropdown
          options={queueNames}
          onSelect={(value) => {
            selectQueue(value);
          }}
          placeholder="Select a word"
        />
        <Dropdown
          options={wordNames}
          onSelect={(value) => {
            setWord(value);
          }}
          placeholder="Select a word"
        />
        <WordCreator createNewWord={createNewWord} />
        {showGTWVEditor && (
          <GTWVEditor
            handleSubmit={(value) => {
              setShowGTWVEditor(false);
              addToTemplatePool(value.key, value.value, value.args);
            }}
          />
        )}
        <button
          onClick={() => {
            setShowGTWVEditor(!showGTWVEditor);
          }}
        >
          toggle GTWV Editor
        </button>

        {!loading && (
          <>
            <TemplateEditors
              postMessage={vscode.postMessage}
              configPath={CONFIG_PATH}
              filledGeneratorsFileText={filledGeneratorsFileText}
              templateModule={templateModule}
              allFileTemplates={allFileTemplates}
              runnableWords={runnableWords}
              templateDefinitions={[
                {
                  name: currentWordName,
                  wordSteps: currentWord,
                  meta: {
                    generators: buildAllGeneratorsTemplate(generatorsFileText),
                  },
                  subTemplate // added separately here bc it's for display purposes
                },
                {
                  name: "generators",
                  wordSteps: [{ result: {} }],
                  meta: {
                    generators: buildAllGeneratorsTemplate(generatorsFileText),
                  },
                },
              ]}
            />
          </>
        )}
        {/*<BuilderAccordion 
          generatorsFileText={generatorsFileText} 
          templatesFileText={templatesFileText} 
          wordsFileText={wordsFileText} 
          postMessage={vscode.postMessage}
        />*/}
      </CssVarsProvider>
    </div>
  );
};

export default App;
`,
'fileContents31': ()=>`
`,
'fileContents32': ()=>`
import { tts } from "symmetric-parser";
import * as fsService from "../services/fsService";
import { runWord, TemplateAsString } from "../services/wordRunService";
import { compact } from "lodash";

export type DequeueConfig = {
  name: string;
  description: string;
  steps: DequeueStep[];
};
export type DequeueStep = {
  type: "fs" | "template";
  config: string;
  name: string;
  description: string; // tooltip, explanations, etc
  word?: string; // just the name. runs before sending template to the frontend
  waitForTransitionCommand: boolean;
  runWithEmptyTemplate: boolean;
  transitionAction: string; //"get" // getOrCreate
  subTemplate?: TemplateAsString;
};

const typeToHandlerMap = {
  fs: handleFs,
  template: handleTemplate,
};

async function handleRunStep(
  step: DequeueStep,
  templateAsString: TemplateAsString
): Promise<TemplateAsString> {
  // basically a super-router.
  try {
    const { type } = step;
    const handler = typeToHandlerMap[type];
    if (handler == null)
      throw new Error(ェhandleRunStep: handler doesn't exist for type §{type}ェ);
    const result = await handler(step, templateAsString);
    return result;
  } catch (e) {
    throw new Error(e);
  }
}

// basically a router.
const fsActionToServiceMap = {
  get: fsService.get, // controller action?
  getOrCreate: fsService.getOrCreate,
  identity: fsService.identity,
};

// can be made generic?
async function handleFs(
  step: DequeueStep,
  input: TemplateAsString
): Promise<TemplateAsString> {
  const { config, transitionAction } = step;
  const action = fsActionToServiceMap[transitionAction];
  const result = await action(config, input);
  return result;
}

async function handleTemplate(
  step: DequeueStep,
  templateAsString: TemplateAsString
): Promise<TemplateAsString> {
  // ...
  return templateAsString;
}

// make it agnostic from WHAT gets ran
type SubscribeCb = (step: DequeueStep, template: TemplateAsString) => void;

export default class Runner {
  steps: DequeueStep[];
  currentStep: DequeueStep;
  currentTemplate: TemplateAsString;
  subscribed: Map<string, SubscribeCb>;
  isRunning: boolean;
  constructor(steps: DequeueStep[]) {
    if (steps == null || steps.length === 0) {
      this.steps = [];
    } else {
      this.steps = steps;
    }
    this.subscribed = new Map();
    this.isRunning = false;
    this.currentStep = this.steps[0];
  }
  append(steps: DequeueStep[]) {
    this.steps.push(...steps);
  }
  appendLeft(steps: DequeueStep[]) {
    this.steps.unshift(...steps);
  }
  subscribe(name: string, cb: SubscribeCb) {
    this.subscribed.set(name, cb);
  }
  unsubscribe(name: string) {
    this.subscribed.delete(name);
  }
  onRunNext(step: DequeueStep, template: TemplateAsString) {
    this.subscribed.forEach((cb, key) => {
      try {
        cb(step, template);
      } catch (e) {
        console.error(ェonRunNext failure, §{key} callback failed:ェ);
        console.error(e);
      }
    });
  }
  addSubTemplatesToQueue(templates: TemplateAsString[]) {

    // this is nasty. we basically want to delay the transition action
    // until the subTemplates queue'd steps are ran.
    // then we run the currentStep's transition action.
    // meaning we need to change the currentStep's transition action to identity
    const oldTransitionAction = this.currentStep.transitionAction;
    // use config from current step to deduce what the new config is
    // then add to the queue
    const queueSteps: DequeueStep[] = compact(templates).map((t) => {
      console.log("queueing", t)
      return {
        type: this.currentStep.type,
        config: this.currentStep.config,
        runWithEmptyTemplate: false,
        subTemplate: t,
        waitForTransitionCommand: true,
        description: "Queue item from subTemplate",
        name: this.currentStep.name + "_subTemplate",
        transitionAction: "identity",
      };
    });
    // the final step just runs the original transition action.
    // no need to wait for anything.
    queueSteps.push({
      ...this.currentStep,
      word: null,
      waitForTransitionCommand: false,
      transitionAction: oldTransitionAction,
    });
    this.appendLeft(queueSteps);
    // every handler must implement identity
    this.currentStep.transitionAction = "identity";
    console.log("APPENEDED STEPS", this.steps);
  }

  async initNextStep(
    templateAsString: TemplateAsString = "{}"
  ): Promise<TemplateAsString> {
    this.isRunning = true;
    const step = this.steps.shift();

    if (step == null) {
      console.log("no further steps");
      return templateAsString;
    }
    this.currentStep = step;
    // someone else's event handler, returns void, affects nothing
    this.onRunNext(step, this.currentTemplate);
    const { config, word } = step;

    let stepTemplate =
      step.runWithEmptyTemplate === true ? "{}" : templateAsString;
    if (word != null) {
      const runWordTemplate =
        step.runWithEmptyTemplate === true ? "{}" : templateAsString;
      const { template: runResult, queuedTemplates } = await runWord(
        config,
        word,
        runWordTemplate
      );
      if (queuedTemplates.length > 0) {
        this.addSubTemplatesToQueue(queuedTemplates);
      }
      stepTemplate = runResult;
    }
    this.currentTemplate = stepTemplate;
    if (!step.waitForTransitionCommand) {
      const result = await this.transition(stepTemplate);
      return result;
    } else {
      this.isRunning = false;
      return stepTemplate;
    }
  }
  // transition flow means.....we start at zero and it initializes.
  // then on transition, we run the transition action and pass to the next step
  async transition(input: TemplateAsString = "{}"): Promise<TemplateAsString> {
    // the actual internal runner, returns Template, affects so many things
    const stepResult = await handleRunStep(this.currentStep, input);
    const fullResult = await this.initNextStep(stepResult);
    return fullResult;
  }
}
`,
'fileContents33': ()=>`
import {
  genTemplateWithVars,
  joiner,
  orderedFold,
  performOnNodes,
  recursiveFold,
  stringCleaning,
  swapValuesForGenericKeysWithCb,
  joinOnValue,
  replaceWithAllIsomorphic,
  collapseTemplateAtKey,
  stringUnCleaning,
  multiply,
  divide,
  FoldMode,
  tts,
  argsAndTemplateToFunction,
  findFirst,
  makeTemplateGenericAtKey,
  insertIntoTemplate,
} from "symmetric-parser";

import { Template } from "symmetric-parser/dist/src/templator/template-group";

const generator = genTemplateWithVars(
  {
    generator: () => ェexport function genName(genArgs): Template {genBodyØn}ェ,
  },
  ["genName", "genArgs", "genBody"]
);
export function buildAllGeneratorsTemplate(generatorFile: string) {
  const cleaned = stringCleaning(generatorFile);
  const file = { allGenerators1: () => cleaned };
  const fr = recursiveFold(
    file,
    [generator],
    [],
    { scope: () => ェØnェ },
    "  ",
    1
  );

  const frAll = {
    ...fr.result,
    ...fr.divisors,
  };

  const generatorParseTree = buildGeneratorParseTree(frAll);
  let newTemplate = {};

  performOnNodes(generatorParseTree, "generator", (t: Template) => {
    const genSkel = genTemplateWithVars(
      {
        generator: () => ェgenName(genArgs)ェ,
      },
      ["genName", "genArgs"]
    );
    const nameTempl = makeTemplateGenericAtKey(
      findFirst(t, "genName"),
      "genName"
    );
    // console.log("NAME TEMPL", nameTempl);
    const argsTempl = makeTemplateGenericAtKey(
      collapseTemplateAtKey(t, "genArgs"),
      "genArgs"
    );
    //console.log("ARGS TEMPL", argsTempl);

    // console.log("ALL", multiply(genSkel, multiply(nameTempl, argsTempl)));
    newTemplate = insertIntoTemplate(
      newTemplate,
      multiply(genSkel, multiply(nameTempl, argsTempl))
    );
    return t;
  });
  return newTemplate;
  const stringTree = tts(generatorParseTree, false);
  const uncleaned = stringUnCleaning(stringTree);
  return eval(uncleaned);
}
export function parseGenerators(generatorFile: string) {
  const cleaned = stringCleaning(generatorFile);
  const file = { file: () => cleaned };

  const fr = recursiveFold(
    file,
    [generator],
    [],
    { scope: () => ェØnェ },
    "  ",
    1
  );

  const frAll = {
    ...fr.result,
    ...fr.divisors,
  };

  const generatorParseTree = buildGeneratorParseTree(frAll);

  const generatorMeta = buildGeneratorMeta(generatorParseTree);

  const generatorString = stringUnCleaning(
    "[" + generatorMeta["metas"]() + "]"
  );
  // console.log("EVAL THIS", generatorString);
  const final = eval(generatorString);
  return final;
}
const replaceTempl = genTemplateWithVars(
  {
    typeDef: () => ェ{ typeDefBodyØn}ェ,
  },
  ["typeDefBody"]
);
function buildGeneratorMeta(template: Template) {
  const replacedTypeNames = joinOnValue(
    "MapArg",
    "typeDefName", // better to use a template for the type safety
    "typeDefBody", // refactor for tomorrow^
    (t: Template) => {
      const of = orderedFold(t, [finalTypeKeyVal, finalTypeDefKeyVal], {
        mode: FoldMode.Strict,
      });
      if (of == null) throw new Error("null fold");
      const allOf = { ...of.result, ...of.divisors };
      const iso = multiply(
        replaceWithAllIsomorphic(allOf, [newTypeKeyVal]),
        {}
      );

      return multiply(iso, replaceTempl);
    },
    "typeValue",
    template
  );
  const replacedTypeNames2 = joinOnValue(
    "MapOnto",
    "typeDefName", // better to use a template for the type safety
    "typeDefBody", // refactor for tomorrow^
    (t: Template) => {
      const of = orderedFold(t, [finalTypeKeyVal, finalTypeDefKeyVal], {
        mode: FoldMode.Strict,
      });
      if (of == null) throw new Error("null fold");
      const allOf = { ...of.result, ...of.divisors };
      const iso = multiply(
        replaceWithAllIsomorphic(allOf, [newTypeKeyVal]),
        {}
      );

      return multiply(iso, replaceTempl);
    },
    "typeValue",
    replacedTypeNames
  );
  // console.log("JOIN", replacedTypeNames2);
  const genMeta = performOnNodes(replacedTypeNames2, "generator", buildMeta);
  // console.log("GENMETA", tts(genMeta, false));
  // we want {name: "genName", inputSchema: {metaBody}}
  const allMeta = joiner(genMeta, "meta", "metas", ",Øn");
  return allMeta;
}

function buildMeta(template: Template, index: number): Template {
  const cbFuncStringd = replaceWithAllIsomorphic(template, [newCbTemplFunc]);
  //console.log("CBFUNCSTRING", tts(cbFuncStringd, false));
  const all = performOnNodes(cbFuncStringd, "typeValue", (t: Template) => {
    const folded = orderedFold(cbFuncStringd, [
      stringArrayTypeValueTempl,
      templateArrayTypeValueTempl,
      templateTypeValueTempl,
      stringTypeValueTempl,
      numberTypeValueTempl,
    ]);
    if (folded == null) throw new Error("null fold");
    const all = { ...folded.result, ...folded.divisors };
    // console.log("ALL", tts(all,false));
    return all;
  });

  const swapped = swapValuesForGenericKeysWithCb(all, [
    { key: "schemaTemplType", newValue: () => "'Template'" },
    { key: "schemaStrArrType", newValue: () => "'StringArray'" },
    { key: "schemaStrType", newValue: () => "'String'" },
    { key: "schemaTemplArrType", newValue: () => "'TemplateArray'" },
    { key: "schemaNumType", newValue: () => "'Number'" },
  ]);
  // console.log("SWAPPEd", swapped);
  // what do we want this structure to be again..?
  // g1:()=>ェ{name:"identity",inputSchema:{template:Template}}ェ

  const funcStringd = replaceWithAllIsomorphic(swapped, [
    newFinalRemainderFuncTypes,
  ]);

  const normalized = replaceWithAllIsomorphic(funcStringd, [
    singleLineTypeKeyVal,
  ]);

  const replaced = replaceWithAllIsomorphic(normalized, [
    schemaArrayObjectTypeTempl,
    schemaSingleLineArrayObjectTypeTempl,
  ]);

  const collapsed = collapseTemplateAtKey(replaced, "genArgs");
  if (collapsed == null) throw new Error("null collapsed");

  const joined = joiner(collapsed, "genArgs", "genInputSchema", ",");
  // joiner, uh...works for single values pretty well, too.
  const name = joiner(template, "genName", "genName", "");
  const metaTempl = genTemplateWithVars(
    {
      ["meta" + index]: () =>
        "{ name: 'genName', inputSchema: { genInputSchema }}",
    },
    ["genName", "genInputSchema"]
  );
  const multi = multiply(multiply(joined, metaTempl), name);
  const commaFix = { doubleComma: () => ェ,,ェ };
  const detection = divide(multi, commaFix);
  const newDoubleComma = { doubleComma: () => ェ,ェ };
  const singleCommaOnly = multiply(detection, newDoubleComma);

  //console.log("FINISHEd33", tts(singleCommaOnly,false))
  return singleCommaOnly;
}
function buildGeneratorParseTree(generators: Template) {
  const gWithTypes = orderedFold(generators, [typesTempl]);
  if (gWithTypes == null) {
    throw new Error("No generators found");
  }
  const all = { ...gWithTypes.result, ...gWithTypes.divisors };
  //console.log("perf on nodeds");
  const parsedGenArgs = performOnNodes(all, "genArgs", parseGenArgs);
  //console.log("fin parse tree");
  return parsedGenArgs;
}
function parseGenArgs(template: Template, index: number): Template {
  //console.count("parsegenargs");
  //console.log("*******************************************");
  //console.log("template", template);
  const of = recursiveFold(
    template,
    [
      cbFuncCommaTempl,
      cbFuncNewlineTempl,
      arrayObjectTypeTempl,
      singleLineArrayObjectTypeTempl,
      typeKeyVal,
      inlineSemiColonFuncKeyVal,
      semiColonTypes,
      finalLineTypeFuncKeyVal,
      finalTypeKeyVal,
      finalLineTypeKeyVal,
      remainderTypes,
      finalRemainderFuncTypes,
      finalRemainderTypes,
      singleLineTypeKeyVal,
      finalSingleLineTypeKeyVal,
      singleTypeTempl,
    ],
    [],
    { scope: () => ェØnェ },
    "  ",
    3,
    index
  );
  if (of == null) {
    throw new Error("No genArgs found");
  }

  const all = { ...of.result, ...of.divisors };

  return all;
}

const typesTempl = genTemplateWithVars(
  {
    typeDef: () => ェtype typeDefName = {typeDefBodyØn};ェ,
  },
  ["typeDefName", "typeDefBody"]
);

const typeKeyVal = genTemplateWithVars(
  {
    typeKeyVal1: () => ェØn  typeKeyName: typeValue,ェ,
  },
  ["typeKeyName", "typeValue"]
);
const finalTypeKeyVal = genTemplateWithVars(
  {
    typeKeyVal: () => ェØn  typeKeyName: typeValue;Ønェ,
  },
  ["typeKeyName", "typeValue"]
);
const finalTypeDefKeyVal = genTemplateWithVars(
  {
    typeKeyVal: () => ェ  typeKeyName: typeValue;ェ,
  },
  ["typeKeyName", "typeValue"]
);
const newTypeKeyVal = genTemplateWithVars(
  {
    typeKeyVal: () => ェtypeKeyName: typeValue, ェ,
  },
  ["typeKeyName", "typeValue"]
);
const singleLineTypeKeyVal = genTemplateWithVars(
  {
    typeKeyVal: () => ェtypeKeyName: typeValue,ェ,
  },
  ["typeKeyName", "typeValue"]
);
const finalSingleLineTypeKeyVal = genTemplateWithVars(
  {
    typeKeyVal: () => ェ typeKeyName: typeValueェ,
  },
  ["typeKeyName", "typeValue"]
);

const finalLineTypeFuncKeyVal = genTemplateWithVars(
  {
    typeKeyVal898: () => ェ  typeKeyName: (typeFuncBody) => typeFuncReturnØnェ,
  },
  ["typeKeyName", "typeFuncBody", "typeFuncReturn"]
);
const finalLineTypeKeyVal = genTemplateWithVars(
  {
    typeKeyVal5: () => ェ  typeKeyName: typeValueØnェ,
  },
  ["typeKeyName", "typeValue"]
);
const remainderTypes = genTemplateWithVars(
  {
    typeKeyVal: () => ェtypeKeyName: typeValue;ェ,
  },
  ["typeKeyName", "typeValue"]
);
const finalRemainderFuncTypes = genTemplateWithVars(
  {
    typeKeyVal: () => ェ typeKeyName: (typeFuncBody) => typeFuncReturn ェ,
  },
  ["typeKeyName", "typeFuncBody", "typeFuncReturn"]
);
const newFinalRemainderFuncTypes = genTemplateWithVars(
  {
    typeKeyVal: () => ェ typeKeyName: "(typeFuncBody) => typeFuncReturn",ェ,
  },
  ["typeKeyName", "typeFuncBody", "typeFuncReturn"]
);
const cbFuncCommaTempl = genTemplateWithVars(
  {
    cbTempl: () => ェ  cb: (cbTypeFuncBody) => Template,ェ,
  },

  ["cbTypeFuncBody"]
);
const numberTypeValueTempl = {
  schemaNumType: () => ェnumberェ,
};
const cbFuncNewlineTempl = genTemplateWithVars(
  {
    cbTempl: () => ェ  cb: (cbTypeFuncBody) => Templateェ,
  },

  ["cbTypeFuncBody"]
);
const newCbTemplFunc = genTemplateWithVars(
  {
    cbTempl: () => ェ  cb: "(cbTypeFuncBody) => Template",ェ,
  },

  ["cbTypeFuncBody"]
);
const finalRemainderTypes = genTemplateWithVars(
  {
    typeKeyVal: () => ェ typeKeyName: typeValue ェ,
  },
  ["typeKeyName", "typeValue"]
);

const arrayObjectTypeTempl = genTemplateWithVars(
  {
    arrayNestType: () => ェArray<{objTypeBodyØn  }>ェ,
  },
  ["objTypeBody"]
);

const schemaArrayObjectTypeTempl = genTemplateWithVars(
  {
    arrayNestType: () => ェ[{objTypeBodyØn  }]ェ,
  },
  ["objTypeBody"]
);

const singleLineArrayObjectTypeTempl = genTemplateWithVars(
  {
    arrayObjectType: () => ェArray<{ objTypeBody}>ェ,
  },
  ["objTypeBody"]
);

const schemaSingleLineArrayObjectTypeTempl = genTemplateWithVars(
  {
    arrayObjectType: () => ェ[{ objTypeBody}]ェ,
  },
  ["objTypeBody"]
);

const semiColonTypes = genTemplateWithVars(
  {
    typeKeyVal: () => ェ  typeKeyName: typeValue;ェ,
  },
  ["typeKeyName", "typeValue"]
);

const singleTypeTempl = genTemplateWithVars(
  {
    singleType: () => ェtypeKeyName: typeValueェ,
  },
  ["typeKeyName", "typeValue"]
);
const templateTypeValueTempl = {
  schemaTemplType: () => ェTemplateェ,
};
const stringTypeValueTempl = {
  schemaStrType: () => ェstringェ,
};
const stringArrayTypeValueTempl = {
  schemaStrArrType: () => ェstring[]ェ,
};
const templateArrayTypeValueTempl = {
  schemaTemplArrType: () => ェTemplate[]ェ,
};

const singleLineTypeFuncKeyVal = genTemplateWithVars(
  {
    typeKeyVal: () => ェ  typeKeyName: (typeFuncBody) => typeFuncReturn,Ønェ,
  },

  ["typeKeyName", "typeFuncBody", "typeFuncReturn"]
);

const inlineSemiColonFuncKeyVal = genTemplateWithVars(
  {
    typeKeyVal: () => ェtypeKeyName: (typeFuncBody) => typeFuncReturn;ェ,
  },

  ["typeKeyName", "typeFuncBody", "typeFuncReturn"]
);
`,
'fileContents34': ()=>`
import {
  collapseAllBelowChildrenOfKey,
  sortTemplateByDeps,
  FoldMode,
  genTemplateWithVars,
  joiner,
  joinOnSameValue,
  orderedFold,
  performIfHasTemplates,
  performOnNodes,
  recursiveFold,
  replaceWithAllIsomorphic,
  swapValuesForGenericKeysWithCb,
  generateTemplateFromTemplate,
  multiply,
  mapIndexOfKey1AndValueOfKey2ToKey3,
  performIfGenericKeyIsTemplate,
  performIfHasGenericKey,
  tts,
  makeTemplateGenericAtKey,
  findFirst,
  findLast,
  performIfNotGenericKeyHasValue
} from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";


const fullWord = genTemplateWithVars(
  {
    fullWord: () => ェexport function wordName(wordInput: Template) {
  wordBody
}ェ,
  },
  ["wordName", "wordBody"]
);

export function buildWordFromNameAndBody(name: string, body: Template) {
  const nameTempl = { wordName: () => ェ§{name}ェ };
  const word = multiply(multiply(fullWord, body), nameTempl);
  return word;
}
export function buildWordBodyFromSteps(steps: string) {
  const file = { file: () => steps };
  //console.log("STEPS", steps)
  const stepOf = orderedFold(file, [stepBody], { mode: FoldMode.Strict });
  if (stepOf == null) throw new Error("null fold");
  const stepOfResult = { ...stepOf.result, ...stepOf.divisors };
  //console.log("OFRESULT", tts(stepOfResult, false));
  const sortedByDeps = sortTemplateByDeps(stepOfResult);
  // console.log("OFRESULT", tts(sortedByDeps, false));
  const stepFunctions = performOnNodes(
    sortedByDeps,
    "stepElement",
    createFunctionCodeFromStep
  );
  // console.log("STEP FUNCTIONS", tts(stepFunctions, false));

  const word = buildWordBody(stepFunctions);
  //console.log("FINAL WORD", tts(word, false));

  return word;
}
function buildWordBody(stepExpressions: Template) {
  // create word wrapper with name, etc
  // build the return stmt from the last stepExpression, orderFold on const name =
  const lastStepExpr = findLast(stepExpressions, "stepExpression");

  const something = orderedFold(lastStepExpr, [stepExprName], {
    mode: FoldMode.Strict,
  });
  if (something == null) return stepExpressions;
  const { result } = something;
  const nameExpr = findFirst(result, "name");
  const generic = makeTemplateGenericAtKey(nameExpr, "name");
  const retStepExpr = genTemplateWithVars(
    {
      stepExpression99999: () => ェreturn name;ェ,
    },
    ["name"]
  );
  const returnStmt = multiply(generic, retStepExpr);
  const combined = { ...stepExpressions, ...returnStmt };
  return joiner(combined, "stepExpression", "wordBody", "Øn");
}

function createFunctionCodeFromStep(stepTemplate: Template, index: number) {
  console.log("STEP TEMPLATE", tts(stepTemplate, false));
  const of = recursiveFold(
    stepTemplate,
    [outputNameSchema, templNameSchema, inputSchemaTempl, inputValuesTempl],
    [],
    { scope: () => ェØnェ },
    "  ",
    1
  );
  const ofResult = { ...of.result, ...of.divisors };
  console.log("OF RESULT W#@@@", ofResult);
  const typed = performOnNodes(ofResult, "inputSchema", (t: Template) => {
    // TODO: ADD cb TEMPLATE
    const of = recursiveFold(
      t,
      [
        inputSchemaObjectBody,
        quotedSchemaKeyVal,
        inputSchemaArrayKeyVal, //save for last
        endingSchemaKeyVal,
      ],
      [],
      { scope: () => ェØnェ },
      "  ",
      6
    );
    if (of == null) throw new Error("null fold");
    const allOf = { ...of.result, ...of.divisors };
    // NEW: create code template from the schema stuff
    console.log("ALL OF", tts(allOf, false));
    return allOf;
  });

  const valuesParsed = performOnNodes(typed, "inputValues", (t: Template) => {
    const of = recursiveFold(
      t,
      [
        inputValueObjectBody,
        quotedValueKeyVal, //save for last
        inputValueArrayKeyVal,
        endingValueKeyVal,
      ],
      [],
      { scope: () => ェØnェ },
      "  ",
      6
    );
    if (of == null) throw new Error("null fold");
    const allOf = { ...of.result, ...of.divisors };

    return allOf;
  });
  const templateTypeTempl = {
    templateType: () => ェTemplateェ,
  };

  const stringTypeTempl = {
    stringType: () => ェStringェ,
  };

  const stringArrayTypeTempl = {
    stringArrayType: () => ェStringArrayェ,
  };

  const templateArrayTypeTempl = {
    templateArrayType: () => ェTemplateArrayェ,
  };

  const numberTypeTempl = {
    numberType: () => ェNumberェ,
  };

  const joinedOnValue = joinOnSameValue(
    "schemaInputKey",
    "valueInputKey",
    (t: Template) => {
      console.log("JOIN ON VALUE", tts(t, false));
      // we leave strings as is, so don't bother transforming them.
      // stick to Template and Number.
      // ONLY DO THIS on the schemaInputKey. If you check valueInputKey for these templates, it'll snag the wrong ones.
      const t1 = performIfGenericKeyIsTemplate(
        t,
        "schemaInputValue",
        templateTypeTempl,
        (t: Template) => {
          // the beautiful replaceWithAllIsomorphic
          // DO THE THING HERE WHERE WE REPLACE THE STRING
          console.log("THIS IS WHERE WE DO IT", t);
          const iso = replaceWithAllIsomorphic(t, [
            quotedKeyUnquotedValueTemplPool,
          ]);
          console.log("AND THEN ISO", iso);
          return iso;
        }
      );

      const t2 = performIfGenericKeyIsTemplate(
        t1,
        "schemaInputValue",
        templateArrayTypeTempl,
        (t: Template) => {
          // you can flip and flop and do a bunch of gymnastics
          // but sometime the quickest path is just a string replace.
          const newlyArrayed = swapValuesForGenericKeysWithCb(t, [
            {
              key: "valueInputValue",
              newValue: (str: string) => {
                return ェ[§{str
                  .split('"')
                  .map((s) => (s.includes("Øn") ? s : "templPool." + s))
                  .join("")}]ェ;
              },
            },
          ]);

          return newlyArrayed;
        }
      );

      const t3 = performIfHasTemplates(t2, [numberTypeTempl], (t: Template) => {
        const iso = replaceWithAllIsomorphic(t, [quotedKeyUnquotedValue]);
        return iso;
      });

      return t3;
    },
    valuesParsed,
    undefined
  );

  // this will come home to bite us.
  // it only collapses the arrays.
  // what when there's an object to pass?
  // ...actually I guess you'd just pass the object.
  // ......huh.
  const collapsedAtArray = collapseAllBelowChildrenOfKey(
    joinedOnValue,
    "inputValueArrayKeyVal"
  );
  const collapsedSchema = collapseAllBelowChildrenOfKey(
    collapsedAtArray,
    "inputSchemaArrayKeyVal"
  );
  console.log("COLLAPSEATARRY", tts(collapsedSchema, false));
  const joinedOnValueAfterCollapse = joinOnSameValue(
    "valueInputKey",
    "schemaInputKey",
    (t: Template) => {
      console.log("NEXT JOIN ON VALUE", t);
      // we leave strings as is, so don't bother transforming them.
      // stick to Template and Number.
      const t0 = performIfHasGenericKey(
        t,
        "inputSchemaArrayKeyVal",
        (t: Template) => {
          //  console.log("OBJECT WORK", tts(t,false))
          const newlyArrayed = swapValuesForGenericKeysWithCb(t, [
            {
              key: "valueInputValue",
              newValue: (str: string) => ェ[§{str}]ェ,
            },
          ]);
          return newlyArrayed;
        }
      );
      //console.log("__________________________________________")
      const t1 = performIfGenericKeyIsTemplate(
        t0,
        "schemaInputValue",
        stringTypeTempl,
        (t: Template) => {
          // the beautiful replaceWithAllIsomorphic
          const swapped = swapValuesForGenericKeysWithCb(t, [
            { key: "valueInputValue", newValue: (s) => ェ"§{s}"ェ },
          ]);
          return swapped;
        }
      );
      const t2 = performIfGenericKeyIsTemplate(
        t1,
        "schemaInputValue",
        templateTypeTempl,
        (t: Template) => {
          // performIfHasValue(t, "schemaInputKey", "input", (t: Template) => { })
          const res = performIfNotGenericKeyHasValue(
            t,
            "schemaInputKey",
            "input",
            (t: Template) => {
              console.log("I THINK THIS IS IT", t);
              const swapped = swapValuesForGenericKeysWithCb(t, [
                { key: "valueInputValue", newValue: (s) => ェtemplPool.§{s}ェ },
              ]);
              return swapped;
            }
          );
          return res;
        }
      );
      // what I want from this is {arg232: () => viv}
      const t3 = mapIndexOfKey1AndValueOfKey2ToKey3(
        t2,
        "schemaInputKey",
        "valueInputValue",
        "arg"
      );
      console.log("WHAT IS t2", t3);
      return t3;
    },
    collapsedSchema,
    "schemaInputKey"
  );
  console.log("POST COLLAPDS", tts(joinedOnValueAfterCollapse, false));

  const wordTemplate = generateTemplateFromTemplate(
    joinedOnValueAfterCollapse,
    "stepExpression" + index,
    ェconst varNameForOutput = templName(arg);ェ,
    ["varNameForOutput", "templName", "arg"],
    [{ key: "arg", delimiter: ", " }]
  );

  const step = multiply(wordTemplate, joinedOnValueAfterCollapse);
  // console.log("step TEMPLATE", tts(step, false));
  return step;
  /*
  const sortedJoinedOnValueAfterCollapse = sortTemplateByDeps(
    joinedOnValueAfterCollapse
  );
  //console.log("SORTED", tts(sortedJoinedOnValueAfterCollapse, false));
  const joinedValues = joiner(
    sortedJoinedOnValueAfterCollapse,
    "valueInputValue",
    "stepArgs",
    ", "
  );
  //console.log("ALL JOINED", tts(joinedValues, false));

  const stepTempl = genTemplateWithVars(
    {
      ["stepExpression" + index]: () =>
        ェconst varNameForOutput = templName(stepArgs);Ønェ,
    },
    ["varNameForOutput", "templName", "stepArgs"]
  );

  const step = applyToGenericHomomorphism(
    { ...collapsedAtArray, ...joinedValues },
    stepTempl
  );
  
  console.log("STEP FINAL", tts(step,false))
  return step;
  */
}

const inputSchemaTempl = genTemplateWithVars(
  {
    inputSchema: () => ェØn    "inputSchema": {schemaBody
    }ェ,
  },
  ["schemaBody"]
);

const inputValuesTempl = genTemplateWithVars(
  {
    inputValues: () => ェØn    "inputValues": {inputValuesBody
    }ェ,
  },
  ["inputValuesBody"]
);
const templNameSchema = genTemplateWithVars(
  {
    templNameSchema: () => ェØn    "name": "templName",ェ,
  },
  ["templName"]
);

const outputNameSchema = genTemplateWithVars(
  {
    outputNameSchema: () => ェØn    "outputName": "varNameForOutput",ェ,
  },
  ["varNameForOutput"]
);

const inputSchemaArrayKeyVal = genTemplateWithVars(
  {
    inputSchemaArrayKeyVal: () =>
      ェØn      "schemaInputKey": [schemaInputValueØn      ],ェ,
  },
  ["schemaInputKey", "schemaInputValue"]
);

const inputSchemaObjectBody = genTemplateWithVars(
  {
    inputSchemaObjectBody: () => ェ      {schemaObjectBodyØn      }ェ,
  },
  ["schemaObjectBody"]
);

const quotedSchemaKeyVal = genTemplateWithVars(
  {
    inputSchemaKeyVal: () => ェØn    "schemaInputKey": "schemaInputValue",ェ,
  },
  ["schemaInputKey", "schemaInputValue"]
);

const endingSchemaKeyVal = genTemplateWithVars(
  {
    inputSchemaKeyVal: () => ェØn    "schemaInputKey": "schemaInputValue"ェ,
  },
  ["schemaInputKey", "schemaInputValue"]
);

const inputValueArrayKeyVal = genTemplateWithVars(
  {
    inputValueArrayKeyVal: () =>
      ェØn      "valueInputKey": [valueInputValueØn      ]ェ,
  },
  ["valueInputKey", "valueInputValue"]
);

const inputValueObjectBody = genTemplateWithVars(
  {
    inputValueObjectBody: () => ェ      {valueObjectBodyØn      }ェ,
  },
  ["valueObjectBody"]
);

const quotedValueKeyVal = genTemplateWithVars(
  {
    inputValueKeyVal: () => ェØn    "valueInputKey": "valueInputValue",ェ,
  },
  ["valueInputKey", "valueInputValue"]
);

const quotedKeyUnquotedValue = genTemplateWithVars(
  {
    inputValueKeyVal: () => ェØn    "valueInputKey": valueInputValue,ェ,
  },
  ["valueInputKey", "valueInputValue"]
);

const quotedKeyUnquotedValueTemplPool = genTemplateWithVars(
  {
    inputValueKeyVal: () => ェØn    "valueInputKey": templPool.valueInputValue,ェ,
  },
  ["valueInputKey", "valueInputValue"]
);

const endingValueKeyVal = genTemplateWithVars(
  {
    inputValueKeyVal: () => ェØn    "valueInputKey": "valueInputValue"ェ,
  },
  ["valueInputKey", "valueInputValue"]
);

const stepBody = genTemplateWithVars(
  {
    stepBody: () => ェØn  {stepElementØn  }ェ,
  },
  ["stepElement"]
);

const stepExprName = genTemplateWithVars(
  {
    stepExprName: () => ェconst name = ェ,
  },
  ["name"]
);
`,
'fileContents35': ()=>`
const React = require('react');
const ReactDOM = require('react-dom');
import '@fontsource/inter';

// Component import
import App from './components/App';

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
`,
'fileContents36': ()=>`
export function getNonce() : string {
  let text : string = "";
  const possible : string =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}`,
'fileContents37': ()=>`
import * as vscode from 'vscode';
import PanelClass from './panel'


export function activate(extContext: vscode.ExtensionContext) {
    extContext.subscriptions.push(vscode.commands.registerCommand('symmetric-blueprints.start', () => {
        PanelClass.createOrShow(extContext);
	}));
    extContext.subscriptions.push(vscode.commands.registerCommand('symmetric-blueprints.insertActiveEditorFile', () => {
        PanelClass.insertFileIntoTemplate(extContext);
	}));
};

export function deactivate() { }`,
'fileContents38': ()=>`
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { readFromConfig } from "./services/commandService";
import { FoldMode, genTemplateWithVars, orderedFold, stringCleaning, tts } from "symmetric-parser";

const execAsync = promisify(exec);

const fullWord = genTemplateWithVars(
  {
    fullWord: () => ェexport function wordName(wordInput: Template): Template {wordBodyØn}ェ,
  },
  ["wordName", "wordBody"]
);
// Run the compiled index.js file
export async function runIndexFile(outputDirectory) {
  const indexPath = path.join(outputDirectory, "src/index.ts");
  try {
    const { stdout, stderr } = await execAsync(ェbun run §{indexPath}ェ);
    console.log("FROM STDOUT", stdout);
    if (stderr) console.error(stderr);
    return stdout;
  } catch (error) {
    console.error(ェExecution error: §{error}ェ);
  }
}

export async function saveWord(wordContents: string, wordsFilePath: string) {
  const wordsContents = await fs.readFile(wordsFilePath, { encoding: "utf8" });
  const cleaned = stringCleaning(wordsContents)
  const t = {file: ()=> cleaned}
  const wordTempls = orderedFold(t, [fullWord],{mode:FoldMode.AllOrNothing}) 
  if(wordTempls == null) {
    console.error("Could not parse word file for some reason")
    return;
  }
  const {result, divisors} = wordTempls;
  console.log("result", tts(result,false), "divisors", tts(divisors,false))
  
}

export async function saveFile(filePath:string,fileContents:string) {
  return fs.writeFile(filePath, fileContents);
}

export async function readFile(filePath:string) {
  return fs.readFile(filePath, { encoding: "utf8" });
}

export async function runTs(generatorFilePath: string) {
  try {
    const { stdout, stderr } = await execAsync(ェbun run §{generatorFilePath}ェ);
    console.log("generator FROM STDOUT", stdout);
    if (stderr) console.error(stderr);
    return stdout;
  } catch (error) {
    console.error(ェExecution error: §{error}ェ);
  }
}`,
'fileContents39': ()=>`
`,
'hookHandlerBody01': ()=>`
        console.log("handling generator result");
        handleQueueUpdate(message);
        `,
'hookHandlerBody02': ()=>`
        console.log("handling generator result")
        handleGeneratorResult(message);
        `,
'hookHandlerBody03': ()=>` {
        if (isMainTemplate) {
          const { contents, filePath } = message.data;
          const funcPart = argsAndTemplateToFunction([], contents);
          const templ = { [filePath]: funcPart };
          //console.log("FILE INSERT", contents, filePath, templ);
          insertTemplateIntoTemplate(templ);
        }
        `,
'hookHandlerName01': ()=>`queue_update`,
'hookHandlerName02': ()=>`generator_result`,
'hookHandlerName03': ()=>`file_insert`,
'panelCommandBody01': ()=>` {
            const { template } = msg;

            const templ = new Function("return " + template)();
            // we expect a compiled template here, so no denoms for anything, or an error if so
            const templFileKeys = Object.keys(templ).filter(
              (k) => k.indexOf(".") > -1
            );
            //console.log("TEMPL FILE KEYS", templFileKeys);
            const pathToConfig = this.runner.currentStep.config;
            const filePathHashes = await getFilePathHashes(pathToConfig);
            //console.log("FILE PATH HASHES", filePathHashes);
            for (const filePathHash of templFileKeys) {
              //console.log("filepathhash", filePathHash);
              // we expect a compiled template here, so no denoms for anything, or an error if so
              const filePath = filePathHashes[filePathHash];
              //console.log("FILE PATH", filePath);
              const fileContents = templ[filePathHash]();
              //console.log("writing file", filePath, "Øn<>CONTENTS<>Øn",fileContents);
              await overwriteFile(filePath, fileContents);
            }

            `,
'panelCommandBody02': ()=>`
            console.log("message received");
            // ensure bun is set up for the thing

            `,
'panelCommandBody03': ()=>`
            console.log("reachedBrain");
            this._panel!.webview.postMessage({ command: "refactor" });
            `,
'panelCommandBody04': ()=>`
            `,
'panelCommandBody05': ()=>` {
            const { word } = msg;
            const pathToConfig = this.runner.currentStep.config;
            const wordsFile = await readFromConfig("WORDS_FILE", pathToConfig);
            // save to word file
            const result = await saveWord(word, wordsFile);
            `,
'panelCommandName01': ()=>`save_all_files`,
'panelCommandName02': ()=>`startup`,
'panelCommandName03': ()=>`testing`,
'panelCommandName04': ()=>`build_project`,
'panelCommandName05': ()=>`save_word`,
'panelCommandName06': ()=>`store_runnable_word`,
'panelCommandName07': ()=>`get_word`,
'panelCommandName08': ()=>`create_word`,
'panelCommandName09': ()=>`add_full_template`,
'panelCommandName010': ()=>`add_template`,
'panelCommandName011': ()=>`run_generator`,
'panelCommandName012': ()=>`run_word`,
'panelCommandName013': ()=>`add_filled_generator`,
'panelCommandName014': ()=>`save_word_steps`,
'panelCommandName015': ()=>`transition`,
'panelCommandName016': ()=>`select_queue`,
'panelCommandName017': ()=>`fetch_from_config`,
'webviewCommandName11': ()=>`config_data`,
'webviewCommandName12': ()=>`config_data`,
'webviewCommandName13': ()=>`config_data`,
'webviewCommandName14': ()=>`word_saved`,
'webviewCommandName15': ()=>`all_filled_generators`,
'webviewCommandName16': ()=>`word_run_result`,
'webviewCommandName17': ()=>`generator_result`,
'webviewCommandName18': ()=>`all_templates`,
'webviewCommandName19': ()=>`all_templates`,
'webviewCommandName110': ()=>`word_contents`,
'webviewCommandName111': ()=>`word_contents`,
'webviewCommandName112': ()=>`all_runnable_words`
};
// @ts-ignore
const result = performOnLinkedBySections(template, [   { from: "commandSend", to: "panelCommand", by: "commandName" },   {     from: "panelCommand",     to: "hookCmdHandleSection",     by: "webviewCommandName",   }, ], buildQueue);
console.log(tts(result,false));