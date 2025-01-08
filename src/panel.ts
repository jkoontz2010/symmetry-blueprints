import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import * as fs from "fs";
import { deleteFile, readFile, runTs, saveFile, saveWord } from "./compiler";
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
import { parseWordRunResult, runWord } from "./services/wordRunService";
import Runner, { DequeueConfig } from "./runner/runner";
import { fetchFromConfig } from "./services/configService";
import { get } from "lodash";
import { getQueues } from "./services/queueService";

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

export function getTemplateFile(poolDir: string) {
  return poolDir + "/template-pool.ts";
}

export function getWordsFile(poolDir: string) {
  return poolDir + "/word-pool.ts";
}

export function getTemplateGetterFile(poolDir: string) {
  return poolDir + "/template-getter.ts";
}

export function getFilledGeneratorsFile(poolDir: string) {
  return poolDir + "/filledGenerators.json";
}

export function getPoolDirFromConfig(config: vscode.WorkspaceConfiguration) {
  const queueType = this.runner.currentStep.type;
  let storageDir = config.get<string>("storageDir");
  if (storageDir[storageDir.length - 1] !== "/") {
    storageDir += "/";
  }
  if (queueType === "fs") {
    return storageDir + "fs-pool";
  } else if (queueType === "template") {
    return storageDir + "template-pool";
  }
}

export default class PanelClass {
  public static currentPanel: PanelClass | undefined;

  private static readonly viewType = "PanelName";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _extContext: vscode.ExtensionContext;
  private _disposables: vscode.Disposable[] = [];
  private pathToConfig: string;
  private runner: Runner;

  getConfig() {
    return vscode.workspace.getConfiguration("symmetric-blueprints");
  }
  buildRunnerConfig() {
    const config = this.getConfig();
    return {
      fsPoolDir: config.get<string>("storageDir") + "/fs-pool",
      templatePoolDir: config.get<string>("storageDir") + "/template-pool",
      fsReadFromBaseDir: config.get<string>("fsReadFromBaseDir"),
      fsIgnoreFileWithStringCSV: config.get<string>(
        "fsIgnoreFileWithStringCSV"
      ),
      storeResultsFile: config.get<boolean>("storeResultsFile"),
      keepWordRunFile: config.get<boolean>("keepWordRunFile"),
      keepGeneratorRunFile: config.get<boolean>("keepGeneratorRunFile"),
    };
  }
  getPoolDir() {
    const config = this.getConfig();
    const queueType = this.runner.currentStep.type;
    let storageDir = config.get<string>("storageDir");
    if (storageDir[storageDir.length - 1] !== "/") {
      storageDir += "/";
    }
    if (queueType === "fs") {
      return storageDir + "fs-pool";
    } else if (queueType === "template") {
      return storageDir + "template-pool";
    }
  }
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
      const currentQueue =
        this.runner.steps?.map((step) => ({
          type: step.type,
          name: step.name,
          description: step.description,
          word: step.word ?? "-",
          isWaitingForCommand: step.waitForTransitionCommand,
          transitionAction: step.transitionAction,
        })) ?? [];
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
    this._panel.webview.onDidReceiveMessage(
      async (msg: any) => {
        switch (msg.command) {
          case "save_all_files": {
            const { template } = msg;

            const templ = new Function("return " + template)();
            // we expect a compiled template here, so no denoms for anything, or an error if so
            const templFileKeys = Object.keys(templ).filter(
              (k) => k.indexOf(".") > -1
            );
            //console.log("TEMPL FILE KEYS", templFileKeys);

            const filePathHashes = await getFilePathHashes(this.getPoolDir());
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

            const wordsFile = getWordsFile(this.getPoolDir());
            // save to word file
            const result = await saveWord(word, wordsFile);
            break;
          }
          case "store_runnable_word": {
            const { word } = msg;
            const poolDir = this.getPoolDir();

            try {
              await saveRunnableWord(poolDir, word);
              const runnableWords = await getAllRunnableWords(poolDir);
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
            const poolDir = this.getPoolDir();
            const wordPath = await getWordPath(poolDir, wordName);
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
            const poolDir = this.getPoolDir();
            const wordFile = poolDir + "/word_" + wordName + ".json";
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
            const poolDir = this.getPoolDir();
            const templatesFilePath = getTemplateFile(poolDir);
            const templatesFile = await readFromFile(templatesFilePath);
            //console.log("CURR TEMPLATES FILE", templatesFile);
            // write template to templates file
            const newTemplatesFile =
              templatesFile + "\n" + `export const ${name} = ${template}\n\n`;
            //console.log("NEW TEMPLATES FILE", newTemplatesFile)
            fs.writeFile(templatesFilePath, newTemplatesFile, (err) => {
              if (err) {
                console.error(err);
              }
              console.log("success");
            });

            // bun run the file and send the result to the frontend

            const templateModule = await runTs(getTemplateGetterFile(poolDir));
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
            const { key, template } = msg;

            const poolDir = this.getPoolDir();

            const templatesFile = await readFromFile(getTemplateFile(poolDir));
            console.log("CURR TEMPLATES FILE", templatesFile);
            // write template to templates file
            const newTemplatesFile =
              templatesFile + "\n" + `export const ${key} = ${template}\n\n`;
            console.log("NEW TEMPLATES FILE", newTemplatesFile);
            fs.writeFile(getTemplateFile(poolDir), newTemplatesFile, (err) => {
              if (err) {
                console.error(err);
              }
              console.log("success");
            });
            // bun run the file!
            const templateModule = await runTs(getTemplateGetterFile(poolDir));
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

            const poolDir = this.getPoolDir();
            const filePrefix = Date.now();
            const generatorRunFile = await createRunnableGeneratorFileContents(
              poolDir,
              generatorString,
              template
            );
            const generatorFile = filePrefix + "_generator.ts";
            const resultFile = filePrefix + "_result";
            const genFilePath = poolDir + "/" + generatorFile;
            const resultFilePath = poolDir + "/" + resultFile;
            await saveFile(genFilePath, generatorRunFile);
            const result = await runTs(genFilePath);
            const { template: tresult, queue } = parseWordRunResult(result);
            this.runner.addSubTemplatesToQueue(queue);
            const config = this.getConfig();
            const willStoreResultsFile = config.get<boolean>(
              "storeResultsFile",
              false
            );
            if (willStoreResultsFile) {
              await saveFile(resultFilePath, tresult);
            }
            const willKeepRunFile = config.get<boolean>(
              "keepGeneratorRunFile",
              false
            );
            if (!willKeepRunFile) {
              deleteFile(genFilePath);
            }
            this._panel!.webview.postMessage({
              command: "generator_result",
              data: {
                msgId,
                generatorFilePath: willKeepRunFile ? genFilePath : "deleted",
                resultFilePath: willStoreResultsFile
                  ? resultFilePath
                  : "deleted",
                result: tresult,
                generatorString,
              },
            });
            break;
          }
          case "run_word": {
            const { wordName, template, msgId } = msg;
            const poolDir = this.getPoolDir();
            const keepWordRunFile = get(
              this.getConfig(),
              "keepWordRunFile",
              false
            );
            const keepResultsFile = get(
              this.getConfig(),
              "storeResultsFile",
              false
            );
            const {
              template: result,
              wordRunFilePath,
              resultFilePath,
              queuedTemplates,
            } = await runWord(
              this.getPoolDir(),
              wordName,
              template,
              keepResultsFile,
              keepWordRunFile
            );
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
            const poolDir = this.getPoolDir();
            const filledGeneratorsPath = getFilledGeneratorsFile(poolDir);

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

            const wordFile = this.getPoolDir() + "/word_" + wordName + ".json";
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

            const poolDir = this.getPoolDir();
            const data = await fetchFromConfig(poolDir, this.runner);

            // so on transition:
            // get the config from the step
            // fetch it all (make a service for it)
            // send it to the frontend like we do on startup
            // also send the current template as a new word result
            const config = this.getConfig();
            const storageDir = config.get<string>("storageDir");
            const queues = await getQueues(storageDir);
            this._panel!.webview.postMessage({
              command: "config_data",
              data: {
                ...data,
                queueNames: JSON.stringify(queues.map((q) => q.name)),
                subTemplate: this.runner.currentStep.subTemplate,
              },
            });
            break;
          }
          case "select_queue": {
            const config = this.getConfig();
            const storageDir = config.get<string>("storageDir");
            const queues = await getQueues(storageDir);
            if (!queues.some((q) => q.name === msg.queueName)) {
              console.log("queue name vs ALL_QUEUES", msg.queueName, queues);
              throw new Error("Queue not found, how did this happen?");
            }
            this.runner = new Runner(
              queues.find((q) => q.name === msg.queueName).steps,
              this.buildRunnerConfig()
            );
            await this.runner.initNextStep();
            const data = await fetchFromConfig(this.getPoolDir(), this.runner);
            this._panel!.webview.postMessage({
              command: "config_data",
              data: {
                ...data,
                queueNames: JSON.stringify(queues.map((q) => q.name)),
              },
            });
            break;
          }
          case "fetch_from_config":
            try {
              const { queueName } = msg;
              if (queueName == null) {
                throw new Error("Queue name is null");
              }
              const config = this.getConfig();
              const storageDir = config.get<string>("storageDir");
              const queues = await getQueues(storageDir);
              const queue = queues.find((q) => q.name === queueName);
              this.runner = new Runner(queue.steps, this.buildRunnerConfig());
              this.runner.unsubscribe("queueUpdate");
              this.runner.subscribe(
                "queueUpdate",
                handleQueueUpdate.bind(this)
              );

              await this.runner.initNextStep();
              // data will equal:
              // GENERATOR_FILE=src/generators/wordBuilder.ts
              // TEMPLATE_FILE=src/templates/wordBuilder.ts
              // WORDS_FILE=src/words/wordBuilder.ts
              // we want to parse each file path and send it back to the webview
              const data = await fetchFromConfig(
                this.getPoolDir(),
                this.runner
              );

              this._panel!.webview.postMessage({
                command: "config_data",
                data: {
                  ...data,
                  queueNames: JSON.stringify(queues.map((q) => q.name)),
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
