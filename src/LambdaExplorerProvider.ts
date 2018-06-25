import * as vscode from 'vscode';
import * as AWS from 'aws-sdk';
import { FunctionConfiguration } from 'aws-sdk/clients/lambda';
import { AWSError } from 'aws-sdk';
import * as _ from 'lodash';
import { Templates } from './Templates';
import { ClientBuilder } from './ClientBuilder';

export interface LambdaObject {
    readonly id: string;
    readonly lambdaClient: AWS.Lambda;
    readonly lambda: FunctionConfiguration;
    getChildren(): vscode.ProviderResult<LambdaObject[]>;
    getTreeItem(): vscode.TreeItem | Thenable<vscode.TreeItem>;
}

export class LambdaExplorerProvider implements vscode.TreeDataProvider<LambdaObject> {
    lambdaClient: AWS.Lambda;
    private _onDidChangeTreeData: vscode.EventEmitter<LambdaObject | undefined> = new vscode.EventEmitter<LambdaObject | undefined>();
    readonly onDidChangeTreeData: vscode.Event<LambdaObject | undefined> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext, lambdaClient: AWS.Lambda, builderContext: ClientBuilder) {
        console.log(process.env);
        this.lambdaClient = lambdaClient;
        this.context.subscriptions.push(
            vscode.commands.registerCommand('lambdaExplorer.invoke', this.invoke),
            vscode.commands.registerCommand('lambdaExplorer.getConfig', this.getConfig),
            vscode.commands.registerCommand('lambdaExplorer.configureRegion', async () => {
                this.lambdaClient = await builderContext.configureRegion('lambda') as AWS.Lambda;
                this.refresh();
            })
        );
    }


    getTreeItem(element: LambdaObject): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element.getTreeItem();
    }
    getChildren(lambda?: LambdaObject): vscode.ProviderResult<any[]> {
        if (lambda) {
            console.log(lambda);
            return lambda.getChildren();
        }
        console.log("No lambda found..");
        return this.getLambdas();
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    // private async reconfigureRegion(configureRegion: Function) {
    //     this.lambdaClient = await configureRegion('lambda') as AWS.Lambda;
    //     await vscode.commands.executeCommand('lambdaExplorer.refresh');
    // }

    private async invoke(element: LambdaObject) {
        const view = vscode.window.createWebviewPanel('html', `Invoked ${element.lambda.FunctionName}`, -1);
        try {
            const baseTemplateFn = _.template(Templates.BaseTemplate);
            view.webview.html = baseTemplateFn({ content: `<h1>Loading...</h1>` });
            const funcResponse = await element.lambdaClient.invoke({ FunctionName: element.lambda.FunctionArn!, LogType: 'Tail' }).promise();
            const logs = funcResponse.LogResult ? Buffer.from(funcResponse.LogResult, 'base64') : "";
            const payload = funcResponse.Payload ? funcResponse.Payload : JSON.stringify({});
            const invokeTemplateFn = _.template(Templates.InvokeTemplate);
            console.log("Logging...");
            view.webview.html = baseTemplateFn({
                content: invokeTemplateFn({
                    FunctionName: element.lambda.FunctionName,
                    LogResult: logs,
                    StatusCode: funcResponse.StatusCode,
                    Payload: payload
                })
            });
        }
        catch (err) {
            const ex: AWSError = err;
            console.log(ex.message);
        }
    }

    private async getConfig(element: LambdaObject) {
        const view = vscode.window.createWebviewPanel('html', `Get config for ${element.lambda.FunctionName}`, -1);
        try {
            const baseTemplateFn = _.template(Templates.BaseTemplate);
            view.webview.html = baseTemplateFn({ content: `<h1>Loading...</h1>` });
            const funcResponse = await element.lambdaClient.getFunctionConfiguration({
                FunctionName: element.lambda.FunctionName!
            }).promise();
            const getConfigTemplateFn = _.template(Templates.GetConfigTemplate);
            console.log("Logging...");

            view.webview.html = baseTemplateFn({
                content: getConfigTemplateFn(funcResponse)
            });
        }
        catch (err) {
            const ex: AWSError = err;
            console.log(ex.message);
        }
    }

    private async getLambdas(): Promise<LambdaObject[]> {
        const status = vscode.window.setStatusBarMessage('Loading lambdas...');
        try {      
            const lambdas = await this.lambdaClient.listFunctions().promise();
            status.dispose();
            const functions = lambdas.Functions ? lambdas.Functions : [];
            return functions.map(l => {
                const name = l.FunctionName ? l.FunctionName : "";
                return new Lambda(name, l, this.lambdaClient);
            });
        } catch (e) {
            status.dispose();
            console.log(e);
            throw e;
        }
    }
}

class Lambda implements LambdaObject {

    constructor(
        readonly id: string,
        readonly lambda: FunctionConfiguration,
        readonly lambdaClient: AWS.Lambda
    ) {
    }

    getChildren(): vscode.ProviderResult<LambdaObject[]> {
        return [];
    }

    getTreeItem(): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const treeItem = new vscode.TreeItem(this.id, vscode.TreeItemCollapsibleState.Collapsed);
        treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
        return treeItem;
    }
}