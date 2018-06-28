import * as vscode from 'vscode';
import { FunctionConfiguration } from "aws-sdk/clients/lambda";

export interface ILambdaNode extends vscode.QuickPickItem {
    readonly id: string;
    readonly lambda: FunctionConfiguration;
    getChildren(): vscode.ProviderResult<ILambdaNode[]>;
    getTreeItem(): vscode.TreeItem | Thenable<vscode.TreeItem>;
}

export class LambdaNode implements ILambdaNode {
    label: string;
    description?: string | undefined;
    detail?: string | undefined;
    picked?: boolean | undefined;

    constructor(
        readonly id: string,
        readonly lambda: FunctionConfiguration
    ) {
        this.label = lambda.FunctionName!;
        this.description = lambda.Description;
    }

    getChildren(): vscode.ProviderResult<ILambdaNode[]> {
        return [];
    }

    getTreeItem(): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const treeItem = new vscode.TreeItem(this.id, vscode.TreeItemCollapsibleState.Collapsed);
        treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
        return treeItem;
    }
}