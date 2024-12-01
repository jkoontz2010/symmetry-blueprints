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

export function deactivate() { }