import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import * as fs from "fs";
import { runIndexFile, saveWord } from "./compiler";
import { readFromConfig } from "./configReader";

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
          case "startup":
            console.log("message received");
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
          case "run_word": {
            const { name, onFile, pathToConfig } = msg;
            console.log("DONIG IT", name, onFile, pathToConfig);
            const projectDir = await readFromConfig(
              "PROJECT_DIR",
              pathToConfig
            );
            // in parallel, compile and run the project
            const runResult = await runIndexFile(projectDir);
            //const readFromFilePromise = readFromFile(onFile)
            //const [compileResult, fileContents] = await Promise.all([compilePromise, readFromFilePromise])
            // in parallel, read file
            console.log("COMPILE RESULT", runResult);
            //console.log("FILE CONTENTS", fileContents);
            // clean contents

            // after both parallels are complete:
            // run word
            // Example usage: Provide the directory with TypeScript files

            this._panel!.webview.postMessage({
              command: "word_output",
              data: {},
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
              const wordsPath = await readFromConfig(
                "WORDS_FILE",
                pathToConfig
              );
              console.log(generatorPath, templatePath, wordsPath);
              const promises = [
                readFromFile(generatorPath),
                readFromFile(templatePath),
                readFromFile(wordsPath),
              ];

              Promise.all(promises).then((data) => {
                const [generators, templates, words] = data;
                this._panel!.webview.postMessage({
                  command: "config_data",
                  data: { generators, templates, words },
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
