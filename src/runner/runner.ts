import { tts } from "symmetric-parser";
import * as fsService from "../services/fsService";
import { runWord, TemplateAsString } from "../services/wordRunService";

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
      throw new Error(`handleRunStep: handler doesn't exist for type ${type}`);
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
        console.error(`onRunNext failure, ${key} callback failed:`);
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
    const queueSteps: DequeueStep[] = templates.map((t) => {
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
