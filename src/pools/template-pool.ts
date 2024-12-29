
import { genTemplateWithVars, run } from "symmetric-parser";


export const genTempl = genTemplateWithVars(
  {
    genTemplate: () => `
const templName = genTemplateWithVars({
  templateDesc},
  keys
  )`,
  },
  ["templName", "templateDesc","keys"]
);

export const arrayDef = genTemplateWithVars({
'arrayDef': ()=>`[arrayElements]`
}, ["arrayElements"]);
export const firstyThisWay = genTemplateWithVars({
'firstyThisWay': ()=>`export const funcName(funcArgs) {funcBody}`
}, ["funcName","funcArgs","funcBody"]);

export const elementTag = genTemplateWithVars({
'elementTag': ()=>`<tagBody>`
}, ["tagBody"]);

export const commandSend = genTemplateWithVars({
'commandSend': ()=>`postMessage({commandBody});`
}, ["commandBody"]);
export const nameProperty = genTemplateWithVars({
'nameProperty': ()=>`command: "commandName",`
}, ["commandName"]);
export const argProperties = genTemplateWithVars({
'argProperties': ()=>`  commandArg,\n`
}, ["commandArg"]);
export const postMessageSend = {
'commandSend02/commandBody02': ({commandBody02})=>`postMessage({${run(commandBody02,'commandBody02')}});`,
'commandBody02/nameProperty11': ({nameProperty11})=>`
      ${run(nameProperty11, 'nameProperty11')}
      generatorRunFile,
      generatorString,
      pathToConfig: CONFIG_PATH,
      msgId,
    `,
'nameProperty11/commandName11': ({commandName11})=>`command: "${run(commandName11,'commandName11')}",`,
'commandName11': ()=>`run_generator`
}
export const postMessageArgs = {
'commandBody02/nameProperty11': ({ nameProperty11 }) => `
      ${run(nameProperty11, "nameProperty11")}
      generatorRunFile,
      generatorString,
      pathToConfig: CONFIG_PATH,
      msgId,
    `,
'nameProperty11/commandName11': ({ commandName11 }) => `command: "${run(commandName11, "commandName11")}",`
}
export const postMessageFull = {
  'commandBody03': () => `
        command: "add_filled_generator",
        generatorRunFile,
        generatorString,
        pathToConfig: CONFIG_PATH,
        msgId,
      `,
  }
export const postCmdArgument = genTemplateWithVars({
'postCmdArgument': ()=>`  commandArg,\n`
}, ["commandArg"]);
export const pathConfigPostArg = genTemplateWithVars({
'pathConfigPostArg': ()=>`  pathToConfig: configPathValue,\n`
}, ["configPathValue"]);
export const readyForPon = {
'fifth.tsxa4023e8966/commandSend01,commandSend02': ({commandSend01, commandSend02})=>`import { cloneDeep, difference, last, uniqueId } from "lodash";
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

export type WordStep = {
  name?: string;
  args?: any[];
  result: Template;
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

  const [wordSteps, setWordSteps] = useState<WordStep[]>(definition.wordSteps);
  function logStep(name, args, result, files = {}) {
    console.log("PREV STEPS", wordSteps);
    const wordStep = {
      name: name,
      args: args,
      result: cloneDeep(result),
      files,
    };

    const newWordSteps = [...wordSteps, wordStep];
    setWordSteps(newWordSteps);
    const stringifiedSteps = newWordSteps.map((ws) => {
      return {
        name: ws.name,
        args: ws.args,
        result:
          typeof ws.result === "string" ? ws.result : tts(ws.result, false),
        files: ws.files,
      };
    });
    console.log("STRINGIFIED STEPS", stringifiedSteps);
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
    let combineWith = { [key]: () => \`\` };
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
    console.log("NEWEST KEY", newestKey);
    let appendedTemplate = appendKeyToKey(newTemplate, newestKey, toKey);
    const result = sortTemplateByDeps(sortTemplateByDeps(appendedTemplate));
    logStep("appendKeyToKey", [newTemplate, newestKey, toKey], result);
    setTemplate(result);
  }

  const handleGeneratorResult = (message: any) => {
    console.log("WORD STEPS ON MESSAGE", wordSteps);

    console.log("MESSAGE DATA", message.data);
    const { generatorFilePath, resultFilePath, result, generatorString } =
      message.data;
    console.log("generator_result", result);
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

  function handleGenericMessage(event: MessageEvent) {
    const message = event.data; // The json data that the extension sent
    switch (message.command) {
      case "file_insert":
        if (isMainTemplate) {
          const { contents, filePath } = message.data;
          const funcPart = argsAndTemplateToFunction([], contents);
          const templ = { [filePath]: funcPart };
          console.log("FILE INSERT", contents, filePath, templ);
          insertTemplateIntoTemplate(templ);
        }
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
        handleGeneratorResult(message);
        break;
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
    const generatorRunFile = formGeneratorFile(
      generatorString,
      template,
      templateModule,
      generatorModule
    );
    // send it over via postMessage
    ${run(commandSend02, 'commandSend02')}
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
  };
}
`,
'commandSend01/commandBody01': ({commandBody01})=>`postMessage({${run(commandBody01,'commandBody01')}});`,
'commandSend02/commandBody02': ({commandBody02})=>`postMessage({${run(commandBody02,'commandBody02')}});`,
'commandBody01': ()=>`
      command: "save_word_steps",
      wordSteps: JSON.stringify(stringifiedSteps),
      wordName,
      pathToConfig: CONFIG_PATH,
      msgId,
    `,
'commandBody02': ()=>`
      command: "run_generator",
      generatorRunFile,
      generatorString,
      pathToConfig: CONFIG_PATH,
      msgId,
    `
}
export const panelCommand = genTemplateWithVars({
'panelCommand': ()=>`case "panelCommandName": panelCommandBodybreak;`
}, ["panelCommandName","panelCommandBody"]);


export const forLink = {
'panel.tsb779abdb70/commandSend03,commandSend04,panelCommand01,panelCommand03,panelCommand04,panelCommand05,panelCommand06,panelCommand07,panelCommand08,panelCommand09,panelCommand010,panelCommand011,panelCommand012,commandSend014,commandSend015,commandSend016,commandSend017': ({commandSend03, commandSend04, panelCommand01, panelCommand03, panelCommand04, panelCommand05, panelCommand06, panelCommand07, panelCommand08, panelCommand09, panelCommand010, panelCommand011, panelCommand012, commandSend014, commandSend015, commandSend016, commandSend017})=>`
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
  return ェ§{fileHash.substring(0, 10)}_§{fileName}ェ;
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

    /*PanelClass.currentPanel._panel.webview.${run(commandSend03, 'commandSend03')}*/
    const fileTemplates = await getAllFileTemplates(
      PanelClass.currentPanel.pathToConfig
    );
    PanelClass.currentPanel._panel.webview.${run(commandSend04, 'commandSend04')}
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
          ${run(panelCommand01, 'panelCommand01')}
          }
          ${run(panelCommand03, 'panelCommand03')}
          }
          ${run(panelCommand04, 'panelCommand04')}
          }
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
            const projectDir = await readFromConfig(
              "PROJECT_DIR",
              pathToConfig
            );
            const wordFile = projectDir + "/word_" + wordName + ".json";
            await saveFile(wordFile, wordSteps);
            this._panel!.webview.${run(commandSend014, 'commandSend014')}
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
                this._panel!.webview.${run(commandSend015, 'commandSend015')}
              });

              //this._panel!.webview.${run(commandSend016, 'commandSend016')}
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
            vscode.${run(commandSend017, 'commandSend017')}
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
'commandSend03/commandBody03': ({commandBody03})=>`postMessage({${run(commandBody03, 'commandBody03')}});`,
'commandSend04/commandBody04': ({commandBody04})=>`postMessage({${run(commandBody04, 'commandBody04')}});`,
'commandSend014/commandBody014': ({commandBody014})=>`postMessage({${run(commandBody014, 'commandBody014')}});`,
'commandSend015/commandBody015': ({commandBody015})=>`postMessage({${run(commandBody015, 'commandBody015')}});`,
'commandSend016/commandBody016': ({commandBody016})=>`postMessage({${run(commandBody016, 'commandBody016')}});`,
'commandSend017/commandBody017': ({commandBody017})=>`postMessage({${run(commandBody017, 'commandBody017')}});`,
'panelCommand01/panelCommandName01,panelCommandBody01': ({panelCommandName01, panelCommandBody01})=>`case "${run(panelCommandName01,'panelCommandName01')}": ${run(panelCommandBody01,'panelCommandBody01')}break;`,
'panelCommandBody01/panelCommand02': ({panelCommand02})=>`{
            const { pathToConfig } = msg;
            console.log("SET CONFIG PATH", pathToConfig);
            this.pathToConfig = pathToConfig;
          }
          ${run(panelCommand02, 'panelCommand02')}{
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
              //console.log("writing file", filePath, "Øn<>CONTENTS<>Øn",fileContents);
              await overwriteFile(filePath, fileContents);
            }

            `,
'panelCommand02/panelCommandName02,panelCommandBody02': ({panelCommandName02, panelCommandBody02})=>`case "${run(panelCommandName02,'panelCommandName02')}": ${run(panelCommandBody02,'panelCommandBody02')}break;`,
'panelCommand03/panelCommandName03,panelCommandBody03': ({panelCommandName03, panelCommandBody03})=>`case "${run(panelCommandName03,'panelCommandName03')}": ${run(panelCommandBody03,'panelCommandBody03')}break;`,
'panelCommandName03/commandSend05': ({commandSend05})=>`startup":
            console.log("message received");
            // ensure bun is set up for the thing

            break;
          case "testing":
            console.log("reachedBrain");
            this._panel!.webview.${run(commandSend05, 'commandSend05')}
            break;
          case "build_project":
            break;
          case "save_word`,
'commandSend05/commandBody05': ({commandBody05})=>`postMessage({${run(commandBody05, 'commandBody05')}});`,
'panelCommand04/panelCommandName04,panelCommandBody04': ({panelCommandName04, panelCommandBody04})=>`case "${run(panelCommandName04,'panelCommandName04')}": ${run(panelCommandBody04,'panelCommandBody04')}break;`,
'panelCommand05/panelCommandName05,panelCommandBody05': ({panelCommandName05, panelCommandBody05})=>`case "${run(panelCommandName05,'panelCommandName05')}": ${run(panelCommandBody05,'panelCommandBody05')}break;`,
'panelCommand06/panelCommandName06,panelCommandBody06': ({panelCommandName06, panelCommandBody06})=>`case "${run(panelCommandName06,'panelCommandName06')}": ${run(panelCommandBody06,'panelCommandBody06')}break;`,
'panelCommand07/panelCommandName07,panelCommandBody07': ({panelCommandName07, panelCommandBody07})=>`case "${run(panelCommandName07,'panelCommandName07')}": ${run(panelCommandBody07,'panelCommandBody07')}break;`,
'panelCommand08/panelCommandName08,panelCommandBody08': ({panelCommandName08, panelCommandBody08})=>`case "${run(panelCommandName08,'panelCommandName08')}": ${run(panelCommandBody08,'panelCommandBody08')}break;`,
'panelCommand09/panelCommandName09,panelCommandBody09': ({panelCommandName09, panelCommandBody09})=>`case "${run(panelCommandName09,'panelCommandName09')}": ${run(panelCommandBody09,'panelCommandBody09')}break;`,
'panelCommand010/panelCommandName010,panelCommandBody010': ({panelCommandName010, panelCommandBody010})=>`case "${run(panelCommandName010,'panelCommandName010')}": ${run(panelCommandBody010,'panelCommandBody010')}break;`,
'panelCommand011/panelCommandName011,panelCommandBody011': ({panelCommandName011, panelCommandBody011})=>`case "${run(panelCommandName011,'panelCommandName011')}": ${run(panelCommandBody011,'panelCommandBody011')}break;`,
'panelCommand012/panelCommandName012,panelCommandBody012': ({panelCommandName012, panelCommandBody012})=>`case "${run(panelCommandName012,'panelCommandName012')}": ${run(panelCommandBody012,'panelCommandBody012')}break;`,
'panelCommandBody011/commandSend013': ({commandSend013})=>`{
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
            this._panel!.webview.${run(commandSend013, 'commandSend013')}
            `,
'commandSend013/commandBody013': ({commandBody013})=>`postMessage({${run(commandBody013, 'commandBody013')}});`,
'panelCommandBody010/commandSend012': ({commandSend012})=>`{
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

            this._panel!.webview.${run(commandSend012, 'commandSend012')}
            `,
'commandSend012/commandBody012': ({commandBody012})=>`postMessage({${run(commandBody012, 'commandBody012')}});`,
'panelCommandBody09/commandSend011': ({commandSend011})=>`{
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

            this._panel!.webview.${run(commandSend011, 'commandSend011')}
            `,
'commandSend011/commandBody011': ({commandBody011})=>`postMessage({${run(commandBody011, 'commandBody011')}});`,
'panelCommandBody08/commandSend010': ({commandSend010})=>`{
            const { key, args, value, pathToConfig } = msg;
            const funcPart = argsAndTemplateToFunction([], value);
            const templ = { [key]: funcPart };
            const templateString = ェgenTemplateWithVars(§{tts(
              templ,
              false
            )}, §{args});ェ;
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
            this._panel!.webview.${run(commandSend010, 'commandSend010')}

            `,
'commandSend010/commandBody010': ({commandBody010})=>`postMessage({${run(commandBody010, 'commandBody010')}});`,
'panelCommandBody07/commandSend09': ({commandSend09})=>`{
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
            console.log("ALL OF TEMPLATE MODULE", templateModule)
            this._panel!.webview.${run(commandSend09, 'commandSend09')}
            `,
'commandSend09/commandBody09': ({commandBody09})=>`postMessage({${run(commandBody09, 'commandBody09')}});`,
'panelCommandBody06/commandSend08': ({commandSend08})=>`{
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
            this._panel!.webview.${run(commandSend08, 'commandSend08')}
            `,
'commandSend08/commandBody08': ({commandBody08})=>`postMessage({${run(commandBody08, 'commandBody08')}});`,
'panelCommandBody05/commandSend07': ({commandSend07})=>`{
            const { wordName, pathToConfig } = msg;
            const wordPath = await getWordPath(pathToConfig, wordName);
            const wordContents = await getWordContents(wordPath);
            this._panel!.webview.${run(commandSend07, 'commandSend07')}
            `,
'commandSend07/commandBody07': ({commandBody07})=>`postMessage({${run(commandBody07, 'commandBody07')}});`,
'panelCommandBody04/commandSend06': ({commandSend06})=>`{
            const { word, pathToConfig } = msg;
            console.log("STORING RUNNABLE WORD", word, pathToConfig);
            try {
              await saveRunnableWord(pathToConfig, word);
              const runnableWords = await getAllRunnableWords(pathToConfig);
              this._panel!.webview.${run(commandSend06, 'commandSend06')}
            } catch (e) {
              console.error(e);
            }
            `,
'commandSend06/commandBody06': ({commandBody06})=>`postMessage({${run(commandBody06, 'commandBody06')}});`,
'fifth.tsxa4023e8966/commandSend01,commandSend02': ({commandSend01, commandSend02})=>`
import { cloneDeep, difference, last, uniqueId } from "lodash";
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

export type WordStep = {
  name?: string;
  args?: any[];
  result: Template;
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

  const [wordSteps, setWordSteps] = useState<WordStep[]>(definition.wordSteps);
  function logStep(name, args, result, files = {}) {
    console.log("PREV STEPS", wordSteps);
    const wordStep = {
      name: name,
      args: args,
      result: cloneDeep(result),
      files,
    };

    const newWordSteps = [...wordSteps, wordStep];
    setWordSteps(newWordSteps);
    const stringifiedSteps = newWordSteps.map((ws) => {
      return {
        name: ws.name,
        args: ws.args,
        result:
          typeof ws.result === "string" ? ws.result : tts(ws.result, false),
        files: ws.files,
      };
    });
    console.log("STRINGIFIED STEPS", stringifiedSteps);
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
    console.log("NEWEST KEY", newestKey);
    let appendedTemplate = appendKeyToKey(newTemplate, newestKey, toKey);
    const result = sortTemplateByDeps(sortTemplateByDeps(appendedTemplate));
    logStep("appendKeyToKey", [newTemplate, newestKey, toKey], result);
    setTemplate(result);
  }

  const handleGeneratorResult = (message: any) => {
    console.log("WORD STEPS ON MESSAGE", wordSteps);

    console.log("MESSAGE DATA", message.data);
    const { generatorFilePath, resultFilePath, result, generatorString } =
      message.data;
    console.log("generator_result", result);
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

  function handleGenericMessage(event: MessageEvent) {
    const message = event.data; // The json data that the extension sent
    switch (message.command) {
      case "file_insert":
        if (isMainTemplate) {
          const { contents, filePath } = message.data;
          const funcPart = argsAndTemplateToFunction([], contents);
          const templ = { [filePath]: funcPart };
          console.log("FILE INSERT", contents, filePath, templ);
          insertTemplateIntoTemplate(templ);
        }
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
        handleGeneratorResult(message);
        break;
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
    const generatorRunFile = formGeneratorFile(
      generatorString,
      template,
      templateModule,
      generatorModule
    );
    // send it over via postMessage
    ${run(commandSend02, 'commandSend02')}
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
  };
}
`,
'commandSend01/commandBody01': ({commandBody01})=>`postMessage({${run(commandBody01, 'commandBody01')}});`,
'commandSend02/commandBody02': ({commandBody02})=>`postMessage({${run(commandBody02, 'commandBody02')}});`,
'commandBody01': ()=>`
      command: "save_word_steps",
      wordSteps: JSON.stringify(stringifiedSteps),
      wordName,
      pathToConfig: CONFIG_PATH,
      msgId,
    `,
'commandBody02': ()=>`
      command: "run_generator",
      generatorRunFile,
      generatorString,
      pathToConfig: CONFIG_PATH,
      msgId,
    `,
'commandBody03': ()=>`
      command: "file_insert",
      data: {
        contents: activeEditorText,
        filePath: filePathHash,
      },
    `,
'commandBody04': ()=>`
      command: "all_file_templates",
      data: {
        fileTemplates: tts(fileTemplates, false),
      },
    `,
'commandBody05': ()=>` command: "refactor" `,
'commandBody06': ()=>`
                command: "all_runnable_words",
                data: {
                  runnableWords: JSON.stringify(runnableWords),
                },
              `,
'commandBody07': ()=>`
              command: "word_contents",
              data: {
                wordName,
                wordContents,
              },
            `,
'commandBody08': ()=>`
              command: "word_contents",
              data: {
                wordName,
                wordContents,
              },
            `,
'commandBody09': ()=>`
              command: "all_templates",
              data: {
                templateModule,
              },
            `,
'commandBody010': ()=>`
              command: "all_templates",
              data: {
                templateModule,
              },
            `,
'commandBody011': ()=>`
              command: "generator_result",
              data: {
                msgId,
                generatorFilePath: genFilePath,
                resultFilePath: resultFilePath,
                result,
                generatorString,
              },
            `,
'commandBody012': ()=>`
              command: "word_run_result",
              data: {
                msgId,
                wordRunFilePath: wordRunFilePath,
                resultFilePath: resultFilePath,
                result,
                wordString: ェ§{wordName}(template)ェ,
              },
            `,
'commandBody013': ()=>`
              command: "all_filled_generators",
              data: {
                msgId,
                allFilledGenerators: tts(newFilledGenerators, false),
              },
            `,
'commandBody014': ()=>`
              command: "word_saved",
              data: {
                msgId,
              },
            `,
'commandBody015': ()=>`
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
                `,
'commandBody016': ()=>` command: 'config_data', data `,
'commandBody017': ()=>` command: 'startup' `,
'panelCommandBody03': ()=>`{
            const { word, pathToConfig } = msg;
            const wordsFile = await readFromConfig("WORDS_FILE", pathToConfig);
            // save to word file
            const result = await saveWord(word, wordsFile);
            `,
'panelCommandBody012': ()=>`{
            const { wordSteps, wordName, pathToConfig, msgId } = msg;
            if (
              wordSteps.length === 0 ||
              wordSteps === "" ||
              wordSteps == null
            ) {
              throw new Error("No steps to save");
              `,
'panelCommandName01': ()=>`set_config_path`,
'panelCommandName02': ()=>`save_all_files`,
'panelCommandName04': ()=>`store_runnable_word`,
'panelCommandName05': ()=>`get_word`,
'panelCommandName06': ()=>`create_word`,
'panelCommandName07': ()=>`add_full_template`,
'panelCommandName08': ()=>`add_template`,
'panelCommandName09': ()=>`run_generator`,
'panelCommandName010': ()=>`run_word`,
'panelCommandName011': ()=>`add_filled_generator`,
'panelCommandName012': ()=>`save_word_steps`
}
export const allTogether = {
'fifth.tsxa4023e8966': ()=>`
import { cloneDeep, difference, last, uniqueId } from "lodash";
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

export type WordStep = {
  name?: string;
  args?: any[];
  result: Template;
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

  const [wordSteps, setWordSteps] = useState<WordStep[]>(definition.wordSteps);
  function logStep(name, args, result, files = {}) {
    console.log("PREV STEPS", wordSteps);
    const wordStep = {
      name: name,
      args: args,
      result: cloneDeep(result),
      files,
    };

    const newWordSteps = [...wordSteps, wordStep];
    setWordSteps(newWordSteps);
    const stringifiedSteps = newWordSteps.map((ws) => {
      return {
        name: ws.name,
        args: ws.args,
        result:
          typeof ws.result === "string" ? ws.result : tts(ws.result, false),
        files: ws.files,
      };
    });
    console.log("STRINGIFIED STEPS", stringifiedSteps);
    const wordName = definition.name;

    postMessage({
      command: "save_word_steps",
      wordSteps: JSON.stringify(stringifiedSteps),
      wordName,
      pathToConfig: CONFIG_PATH,
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
    console.log("NEWEST KEY", newestKey);
    let appendedTemplate = appendKeyToKey(newTemplate, newestKey, toKey);
    const result = sortTemplateByDeps(sortTemplateByDeps(appendedTemplate));
    logStep("appendKeyToKey", [newTemplate, newestKey, toKey], result);
    setTemplate(result);
  }

  const handleGeneratorResult = (message: any) => {
    console.log("WORD STEPS ON MESSAGE", wordSteps);

    console.log("MESSAGE DATA", message.data);
    const { generatorFilePath, resultFilePath, result, generatorString } =
      message.data;
    console.log("generator_result", result);
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

  function handleGenericMessage(event: MessageEvent) {
    const message = event.data; // The json data that the extension sent
    switch (message.command) {
      case "file_insert":
        if (isMainTemplate) {
          const { contents, filePath } = message.data;
          const funcPart = argsAndTemplateToFunction([], contents);
          const templ = { [filePath]: funcPart };
          console.log("FILE INSERT", contents, filePath, templ);
          insertTemplateIntoTemplate(templ);
        }
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
        handleGeneratorResult(message);
        break;
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
    const generatorRunFile = formGeneratorFile(
      generatorString,
      template,
      templateModule,
      generatorModule
    );
    // send it over via postMessage
    postMessage({
      command: "run_generator",
      generatorRunFile,
      generatorString,
      pathToConfig: CONFIG_PATH,
      msgId,
    });
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
  };
}
`,
'panel.tsb779abdb70': ()=>`
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
  return ェ§{fileHash.substring(0, 10)}_§{fileName}ェ;
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
              //console.log("writing file", filePath, "Øn<>CONTENTS<>Øn",fileContents);
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
            const templateString = ェgenTemplateWithVars(§{tts(
              templ,
              false
            )}, §{args});ェ;
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
                wordString: ェ§{wordName}(template)ェ,
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
`
}
export const fullyNoBreak = {
'panel.tsb779abdb70': ()=>`
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
  return ェ§{fileHash.substring(0, 10)}_§{fileName}ェ;
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
              //console.log("writing file", filePath, "Øn<>CONTENTS<>Øn",fileContents);
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
            const templateString = ェgenTemplateWithVars(§{tts(
              templ,
              false
            )}, §{args});ェ;
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
                wordString: ェ§{wordName}(template)ェ,
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
`
}
