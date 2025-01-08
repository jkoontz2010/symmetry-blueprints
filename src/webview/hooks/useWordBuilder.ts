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
  firsty: () => `this is where we do it`,
};
const secondy: Template = {
  secondy: () => `that is the second time`,
};

const thirdy: Template = {
  thirdy: () => `this is the third time`,
};
const fourthy: Template = {
  fourthy: () => `this is the fourth time`,
};
const fifthy: Template = {
  fifthy: () => `this is the fifth time`,
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
    postMessage({
      command: "save_word",
      word: fullWord.fullWord(),
    });
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
