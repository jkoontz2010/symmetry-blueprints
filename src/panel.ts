import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import * as fs from "fs";
import { readFile, runIndexFile, runTs, saveFile, saveWord } from "./compiler";
import {
  argsAndTemplateToFunction,
  genTemplateWithVars,
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
  getFilePathFromHashes,
  overwriteFile,
  getAllFileTemplates,
  saveRunnableWord,
  getAllRunnableWords,
  createRunnableGeneratorFileContents,
} from "./commandService";
import { sha1 } from "js-sha1";
import { formWordRunFile } from "./wordRunService";

function formFilePathHash(filePath: string) {
  const fileName = filePath.split("/").pop();
  const fileHash = sha1(filePath);
  return `${fileHash.substring(0, 10)}_${fileName}`;
}

function readFromFile(file) {
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

export default class PanelClass {
  public static currentPanel: PanelClass | undefined;

  private static readonly viewType = "PanelName";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _extContext: vscode.ExtensionContext;
  private _disposables: vscode.Disposable[] = [];
  private pathToConfig: string;

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
        console.log("DID RECEIVE MSG", msg);
        switch (msg.command) {
          case "set_config_path": {
            const { pathToConfig } = msg;
            console.log("SET CONFIG PATH", pathToConfig);
            this.pathToConfig = pathToConfig;
          }
          case "save_all_files": {
            const { template, pathToConfig } = msg;

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
            const { word, pathToConfig } = msg;
            const wordsFile = await readFromConfig("WORDS_FILE", pathToConfig);
            // save to word file
            const result = await saveWord(word, wordsFile);
            break;
          }
          case "store_runnable_word": {
            const { word, pathToConfig } = msg;
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
            const { wordName, pathToConfig } = msg;
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
            const { wordName, pathToConfig, template } = msg;
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
            const {template, name, pathToConfig} = msg;
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
            console.log("ALL OF TEMPLATE MODULE", templateModule)
            this._panel!.webview.postMessage({
              command: "all_templates",
              data: {
                templateModule,
              },
            });
            break;
          }
          case "add_template": {
            const { key, args, value, pathToConfig } = msg;
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
            const { generatorString, template, pathToConfig, msgId } = msg;
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
            const { wordName, template, pathToConfig, msgId } = msg;
            const projectDir = await readFromConfig(
              "PROJECT_DIR",
              pathToConfig
            );
            const filePrefix = Date.now();
            const wordRunFile = formWordRunFile(wordName, template);
            const wordRunFileName = filePrefix + "_wordRun.ts";
            const resultFile = filePrefix + "_result";
            const wordRunFilePath = projectDir + "/" + wordRunFileName;
            const resultFilePath = projectDir + "/" + resultFile;
            await saveFile(wordRunFilePath, wordRunFile);
            const result = await runTs(wordRunFilePath);
            console.log("word run RESULTv,", result);
            await saveFile(resultFilePath, result);

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
            const { msgId, filledGenerator, pathToConfig } = msg;

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
            const { wordSteps, wordName, pathToConfig, msgId } = msg;
            if (
              wordSteps.length === 0 ||
              wordSteps === "" ||
              wordSteps == null
            ) {
              throw new Error("No steps to save");
              break;
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
          case "fetch_from_config":
            try {
              const { pathToConfig } = msg;

              // data will equal:
              // GENERATOR_FILE=src/generators/wordBuilder.ts
              // TEMPLATE_FILE=src/templates/wordBuilder.ts
              // WORDS_FILE=src/words/wordBuilder.ts
              // we want to parse each file path and send it back to the webview

              const generatorPath = await readFromConfig(
                "GENERATOR_FILE",
                pathToConfig
              );

              const templatePath = await readFromConfig(
                "TEMPLATE_FILE",
                pathToConfig
              );
              const runnableWords = await getAllRunnableWords(pathToConfig);
              const projectDir = await readFromConfig(
                "PROJECT_DIR",
                pathToConfig
              );
              const filledGeneratorsPath =
                projectDir + "/filledGenerators.json";
              const allWordPaths = await getAllWordPathsByLastModified(
                pathToConfig
              );
              const sortedWordPaths = await sortFilesByLastModified(
                allWordPaths
              );

              const templateModule = await runTs(
                projectDir + "/template-getter.ts"
              );

              const promises = [
                readFromFile(generatorPath),
                readFromFile(templatePath),
                readFromFile(filledGeneratorsPath),
                getWordContents(sortedWordPaths[0]),
              ];
              const fileTemplates = await getAllFileTemplates(
                PanelClass.currentPanel.pathToConfig
              );
console.log("FROM STARTUP TEMPLATE MODEUL", templateModule)
              const wordNames = getWordNamesFromWordPaths(allWordPaths);
              const currentWordName = sortedWordPaths[0]
                .split("_")[1]
                .replace(".json", "");
              Promise.all(promises).then((data) => {
                const [generators, templates, filledGenerators, currentWord] =
                  data;
                this._panel!.webview.postMessage({
                  command: "config_data",
                  data: {
                    generators,
                    templates,
                    filledGenerators,
                    currentWord,
                    currentWordName,
                    wordNames: JSON.stringify(wordNames),
                    templateModule,
                    fileTemplates: tts(fileTemplates, false),
                    runnableWords: JSON.stringify(runnableWords),
                  },
                });
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
