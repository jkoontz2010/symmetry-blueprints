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
  name: string;
  description: string; // tooltip, explanations, etc
  word?: string; // just the name. runs before sending template to the frontend
  waitForTransitionCommand: boolean;
  runWithEmptyTemplate: boolean;
  transitionAction: string; //"get" // getOrCreate
  subTemplate?: TemplateAsString;
};

export type RunnerConfig = {
  templatePoolDir: string;
  fsPoolDir: string;
  fsIgnoreFileWithStringCSV: string;
  fsReadFromBaseDir: string;
  storeResultsFile: boolean;
  keepWordRunFile: boolean;
  keepGeneratorRunFile: boolean;
}

const typeToHandlerMap = {
  fs: handleFs,
  template: handleTemplate,
};

async function handleRunStep(
  step: DequeueStep,
  config: RunnerConfig,
  templateAsString: TemplateAsString
): Promise<TemplateAsString> {
  // basically a super-router.
  try {
    const { type } = step;
    const handler = typeToHandlerMap[type];
    if (handler == null)
      throw new Error(`handleRunStep: handler doesn't exist for type ${type}`);
    const result = await handler(step, config, templateAsString);
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
  config: RunnerConfig,
  input: TemplateAsString
): Promise<TemplateAsString> {
  const { transitionAction } = step;
  const action = fsActionToServiceMap[transitionAction];
  const result = await action(config, input);
  return result;
}

async function handleTemplate(
  step: DequeueStep,
  config: RunnerConfig,
  templateAsString: TemplateAsString
): Promise<TemplateAsString> {
  // ...
  return templateAsString;
}

// make it agnostic from WHAT gets ran
type SubscribeCb = (newSteps: DequeueStep[]) => void;

export default class Runner {
  steps: DequeueStep[];
  currentStep: DequeueStep;
  currentTemplate: TemplateAsString;
  subscribed: Map<string, SubscribeCb>;
  isRunning: boolean;
  config: RunnerConfig;
  constructor(steps: DequeueStep[], config: RunnerConfig) {
    if (steps == null || steps.length === 0) {
      this.steps = [];
    } else {
      this.steps = steps;
    }
    this.setConfig(config);
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
  onQueueChange() {
    this.subscribed.forEach((cb, key) => {
      try {
        cb(this.steps);
      } catch (e) {
        console.error(`onQueueChange failure, ${key} callback failed:`);
        console.error(e);
      }
    });
  }
  private getPoolDir() {
    switch (this.currentStep.type) {
      case "fs":
        return this.config.fsPoolDir;
      case "template":
        return this.config.templatePoolDir;
      default:
        throw new Error("getPoolDir: unknown")
    }
  }
  setConfig(config: RunnerConfig) {
    this.config = config;
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
      return {
        type: this.currentStep.type,
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
    console.log("ALL QUEUE STEPS", this.steps, "VS", queueSteps)
    this.onQueueChange();
    // every handler must implement identity
    this.currentStep.transitionAction = "identity";
  }

  async initNextStep(
    templateAsString: TemplateAsString = "{}"
  ): Promise<TemplateAsString> {
    this.isRunning = true;
    // placement is important. here, it will retain the current step in the queue.
    // after this.steps.shift(), the currentStep is no longer in the queue.
    this.onQueueChange();
    const step = this.steps.shift();
    if (step == null) {
      console.log("no further steps");
      return templateAsString;
    }
    this.currentStep = step;
    // someone else's event handler, returns void, affects nothing
    
    const { word } = step;

    let stepTemplate =
      step.runWithEmptyTemplate === true ? "{}" : templateAsString;
    if (word != null) {
      const runWordTemplate =
        step.runWithEmptyTemplate === true ? "{}" : templateAsString;
      const { template: runResult, queuedTemplates } = await runWord(
        this.getPoolDir(),
        word,
        runWordTemplate,
        false,
        false
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
    const stepResult = await handleRunStep(this.currentStep, this.config, input);
    const fullResult = await this.initNextStep(stepResult);
    return fullResult;
  }
}
