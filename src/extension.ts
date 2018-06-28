'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { LambdaExplorerProvider } from './LambdaExplorerProvider';
import { AWSClientBuilder } from './aws-client-builder';
import { ext } from './extensionGlobals';
import { S3ExplorerProvider } from './S3ExplorerProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    ext.clientBuilder = new AWSClientBuilder();
    await ext.clientBuilder.build();
    ext.context = context;
    const lambdaExplorerProvider = new LambdaExplorerProvider(context);
    const s3ExplorerProvider = new S3ExplorerProvider(context);
    ext.trees = [lambdaExplorerProvider, s3ExplorerProvider];
    
    vscode.commands.registerCommand('aws.selectRegion', async () => { await ext.clientBuilder.configureRegion(); });
    vscode.window.registerTreeDataProvider('lambdaExplorer', lambdaExplorerProvider);
    vscode.window.createTreeView('lambdaExplorer', { treeDataProvider: lambdaExplorerProvider });
    vscode.commands.registerCommand('lambdaExplorer.refresh', () => lambdaExplorerProvider.refresh());

    vscode.window.registerTreeDataProvider('s3Explorer', s3ExplorerProvider);
    vscode.window.createTreeView('s3Explorer', { treeDataProvider: s3ExplorerProvider });
    vscode.commands.registerCommand('s3Explorer.refresh', () => s3ExplorerProvider.refresh());
}

// this method is called when your extension is deactivated
export function deactivate() {
}