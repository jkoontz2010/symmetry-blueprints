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
  return `${fileHash.substring(0, 10)}_${fileName}`;
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

    // will have to move this somewhere else for initialization.
    // as-is, this singleton works great for testing.
    this.runner = new Runner(TEST_DEQUEUE.steps);
    this.runner.initNextStep();
    // Create and show a new webview panel
    function handleQueueUpdate() {
      
      const currentQueue = this.runner.steps.map((step) => ({
        type: step.type,
        name: step.name,
        description: step.description,
        word: step.word ?? "-",
        isWaitingForCommand: step.waitForTransitionCommand,
        transitionAction: step.transitionAction,
      }));
      console.log("queue update", currentQueue);
      this._panel!.webview.postMessage({
        command: "queue_update",
        data: {
          currentQueue: JSON.stringify(currentQueue),
        },
      });
    }
    this.runner.subscribe("queueUpdate", handleQueueUpdate.bind(this));
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
    this._panel.webview.onDidReceiveMessage(
      async (msg: any) => {
        let pathToConfig = this.runner.currentStep.config;
        switch (msg.command) {
          case "save_all_files": {
            const { template } = msg;

            const templ = new Function("return " + template)();
            // we expect a compiled template here, so no denoms for anything, or an error if so
            const templFileKeys = Object.keys(templ).filter(
              (k) => k.indexOf(".") > -1
            );
            //console.log("TEMPL FILE KEYS", templFileKeys);
            const filePathHashes = await getFilePathHashes(pathToConfig);
            //console.log("FILE PATH HASHES", filePathHashes);
            for (const filePathHash of templFileKeys) {
              //console.log("filepathhash", filePathHash);
              // we expect a compiled template here, so no denoms for anything, or an error if so
              const filePath = filePathHashes[filePathHash];
              //console.log("FILE PATH", filePath);
              const fileContents = templ[filePathHash]();
              //console.log("writing file", filePath, "\n<>CONTENTS<>\n",fileContents);
              await overwriteFile(filePath, fileContents);
            }

            break;
          }
          case "startup":
            console.log("message received");
            // ensure bun is set up for the thing

            break;
          case "testing":
            console.log("reachedBrain");
            this._panel!.webview.postMessage({ command: "refactor" });
            break;
          case "build_project":
            break;
          case "save_word": {
            const { word } = msg;
            const wordsFile = await readFromConfig("WORDS_FILE", pathToConfig);
            // save to word file
            const result = await saveWord(word, wordsFile);
            break;
          }
          case "store_runnable_word": {
            const { word } = msg;
            console.log("STORING RUNNABLE WORD", word, pathToConfig);
            try {
              await saveRunnableWord(pathToConfig, word);
              const runnableWords = await getAllRunnableWords(pathToConfig);
              this._panel!.webview.postMessage({
                command: "all_runnable_words",
                data: {
                  runnableWords: JSON.stringify(runnableWords),
                },
              });
            } catch (e) {
              console.error(e);
            }
            break;
          }
          case "get_word": {
            const { wordName } = msg;
            const wordPath = await getWordPath(pathToConfig, wordName);
            const wordContents = await getWordContents(wordPath);
            this._panel!.webview.postMessage({
              command: "word_contents",
              data: {
                wordName,
                wordContents,
              },
            });
            break;
          }
          case "create_word": {
            const { wordName, template } = msg;
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
              command: "word_contents",
              data: {
                wordName,
                wordContents,
              },
            });
            break;
          }
          case "add_full_template": {
            // a full template doesn't need to be generated
            // it's the actual object that is a template
            // we just need to add it to the template pool
            const { template, name } = msg;
            const templatesFilePath = await readFromConfig(
              "TEMPLATE_FILE",
              pathToConfig
            );
            const templatesFile = await readFromFile(templatesFilePath);
            console.log("CURR TEMPLATES FILE", templatesFile);
            // write template to templates file
            const newTemplatesFile =
              templatesFile + "\n" + `export const ${name} = ${template}`;
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
              command: "all_templates",
              data: {
                templateModule,
              },
            });
            break;
          }
          case "add_template": {
            const { key, args, value } = msg;
            const funcPart = argsAndTemplateToFunction([], value);
            const templ = { [key]: funcPart };
            const templateString = `genTemplateWithVars(${tts(
              templ,
              false
            )}, ${args});`;
            const templatesFilePath = await readFromConfig(
              "TEMPLATE_FILE",
              pathToConfig
            );
            const templatesFile = await readFromFile(templatesFilePath);
            console.log("CURR TEMPLATES FILE", templatesFile);
            // write template to templates file
            const newTemplatesFile =
              templatesFile + "\n" + `export const ${key} = ${templateString}`;
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
              command: "all_templates",
              data: {
                templateModule,
              },
            });

            break;
          }
          case "run_generator": {
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
              command: "generator_result",
              data: {
                msgId,
                generatorFilePath: genFilePath,
                resultFilePath: resultFilePath,
                result,
                generatorString,
              },
            });
            break;
          }
          case "run_word": {
            const { wordName, template, msgId } = msg;
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
              command: "word_run_result",
              data: {
                msgId,
                wordRunFilePath: wordRunFilePath,
                resultFilePath: resultFilePath,
                result,
                wordString: `${wordName}(template)`,
              },
            });
            break;
          }
          case "add_filled_generator": {
            const { msgId, filledGenerator } = msg;

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
              command: "all_filled_generators",
              data: {
                msgId,
                allFilledGenerators: tts(newFilledGenerators, false),
              },
            });
            break;
          }
          case "save_word_steps": {
            const { wordSteps, wordName, msgId } = msg;
            if (
              wordSteps.length === 0 ||
              wordSteps === "" ||
              wordSteps == null
            ) {
              throw new Error("No steps to save");
            }
            const projectDir = await readFromConfig(
              "PROJECT_DIR",
              pathToConfig
            );
            const wordFile = projectDir + "/word_" + wordName + ".json";
            await saveFile(wordFile, wordSteps);
            this._panel!.webview.postMessage({
              command: "word_saved",
              data: {
                msgId,
              },
            });
            break;
          }
          case "transition": {
            const { template } = msg;
            await this.runner.transition(template);
            pathToConfig = this.runner.currentStep.config;
            console.time("fetchFromConfig");
            const data = await fetchFromConfig(pathToConfig, this.runner);
            console.timeEnd("fetchFromConfig");
            // so on transition:
            // get the config from the step
            // fetch it all (make a service for it)
            // send it to the frontend like we do on startup
            // also send the current template as a new word result
            this._panel!.webview.postMessage({
              command: "config_data",
              data: {
                ...data,
                queueNames: JSON.stringify(ALL_QUEUES.map((q) => q.name)),
                subTemplate: this.runner.currentStep.subTemplate,
              },
            });
            break;
          }
          case "select_queue": {
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
            const data = await fetchFromConfig(pathToConfig, this.runner);
            this._panel!.webview.postMessage({
              command: "config_data",
              data: {
                ...data,
                queueNames: JSON.stringify(ALL_QUEUES.map((q) => q.name)),
              },
            });
            break;
          }
          case "fetch_from_config":
            try {
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
                command: "config_data",
                data: {
                  ...data,
                  queueNames: JSON.stringify(ALL_QUEUES.map((q) => q.name)),
                },
              });

              //this._panel!.webview.postMessage({ command: 'config_data', data });
            } catch (e) {
              console.error(e);
            }
            break;
        }
      },
      null,
      this._disposables
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

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Symmetric Blueprints</title>
        <link rel="stylesheet" href="${styleUri}">
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
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}
