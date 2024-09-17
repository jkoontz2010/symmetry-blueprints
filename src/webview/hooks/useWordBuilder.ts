import { customAlphabet } from "nanoid";
import { useEffect, useState } from "react";
import { genTemplateWithVars } from "symmetric-parser";
import { Template } from "symmetric-parser/dist/src/templator/template-group";
import {
  buildTemplateMeta,
  parseGenerators,
  parseTemplates,
  parseWords,
} from "../util/parsers";
import { buildWordMetas } from "../util/objBuilder";
import { compact } from "lodash";

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
  name: string;
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
    }
    if (type === Types.TemplateArray) {
      inputs[key] = [];
    }
    if (type === Types.String) {
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
  wordsFileText,
  templatesFileText,
  generatorsFileText,
}: {
  wordsFileText: string;
  templatesFileText: string;
  generatorsFileText: string;
}) {
  const [newWord, setNewWord] = useState<BuilderNewWord>({
    name: "new",
    steps: [],
  });
  const [wordsMeta, setWordsMeta] = useState<BuilderWord[]>([]);
  const [templatesMeta, setTemplatesMeta] = useState<BuilderTemplate[]>([]);
  const [generatorsMeta, setGeneratorsMeta] = useState<BuilderGenerator[]>([]);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  useEffect(() => {
    // start with fake, move to ....how do we get from file system.
    // VS Code API. do that separately?
    // need to turn input into meta.
    console.log("STARTING!!");
    const parsedWords = parseWords(wordsFileText);
    const parsedGenerators = parseGenerators(generatorsFileText);
    console.log("DONE, PARSING TEMPLATES");
    const parsedTemplates = buildTemplateMeta(templatesFileText);
    console.log("PARSEDAND GOOD", {
      parsedWords,
      parsedGenerators,
      parsedTemplates,
    });

    console.log("BUILDING WORD METAS? DIDNT WE ALREADY?");
    /*const words = buildWordMetas(parsedWords, "wordDef",{
      "word": "name",
      "outputName": "wordOutput",
      "elementName":"step",
      "elementInputs":"genInputs",
      "genOutput":"outputName"
    });
    console.log("WORDS", words)
    */
    // grab all the meta! apply to the objects! go go go!
    setWordsMeta([
      {
        name: "combineEverything",
        steps: [combineGenerator],
      },
    ]); /*
    setTemplates([
      { name: "firsty", template: firsty },
      { name: "secondy", template: secondy },
      { name: "thirdy", template: thirdy },
      { name: "fourthy", template: fourthy },
      { name: "fifthy", template: fifthy },
      { name: "sixthy", template: sixthy },
    ]);

    setGenerators([identityGenerator, combineGenerator]);
    */
    setGeneratorsMeta(parsedGenerators);
    setTemplatesMeta(compact(parsedTemplates));
  }, [generatorsFileText, templatesFileText, wordsFileText]);

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
      return { ...prev, steps: newSteps };
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
    console.log("NEW STESP", JSON.stringify(newSteps,null,2));
  }

  function removeStepFromWord(position: number) {
    // go thru all steps. if any step uses output from
    // the deleted step, remove that output!
    const { steps } = newWord;
    const removedStep = steps[position];
    const removedOutput = removedStep.outputName;
    const newSteps = steps.filter((step) => {
      console.log("FULL STEP", step);
      if(step.inputs == null) return true
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
    wordsMeta,
    templatesMeta,
    generatorsMeta,
    newWord,
    runtimeError,
    addStepToWord,
    updateStepPosition,
    runWord,
    removeStepFromWord,
    submitWord
  };
}
