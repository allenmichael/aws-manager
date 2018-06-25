'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { LambdaExplorerProvider } from './LambdaExplorerProvider';
import { S3ExplorerProvider } from './S3ExplorerProvider';
import { ClientBuilder } from './ClientBuilder';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    const clientBuilder = new ClientBuilder();
    const lambdaClient = await clientBuilder.build('lambda') as AWS.Lambda;
    const s3Client = await clientBuilder.build('s3') as AWS.S3;
    const lambdaExplorerProvider = new LambdaExplorerProvider(context, lambdaClient, clientBuilder);
    const s3ExplorerProvider = new S3ExplorerProvider(context, s3Client, clientBuilder);

    vscode.window.registerTreeDataProvider('lambdaExplorer', lambdaExplorerProvider);
    vscode.window.createTreeView('lambdaExplorer', { treeDataProvider: lambdaExplorerProvider });
    vscode.commands.registerCommand('lambdaExplorer.refresh', () => lambdaExplorerProvider.refresh()),
    

    vscode.window.registerTreeDataProvider('s3Explorer', s3ExplorerProvider);
    vscode.window.createTreeView('s3Explorer', { treeDataProvider: s3ExplorerProvider });
    vscode.commands.registerCommand('s3Explorer.refresh', () => s3ExplorerProvider.refresh())
}

// this method is called when your extension is deactivated
export function deactivate() {
}