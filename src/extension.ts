import * as vscode from 'vscode';
import PanelClass from './panel'


export function activate(extContext: vscode.ExtensionContext) {
    extContext.subscriptions.push(vscode.commands.registerCommand('symmetric-blueprints.start', () => {
        PanelClass.createOrShow(extContext);
	}));
};

export function deactivate() { }