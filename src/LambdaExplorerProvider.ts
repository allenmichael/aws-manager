import * as vscode from 'vscode';

import { AWSError } from 'aws-sdk';
import * as _ from 'lodash';
import { Templates } from './Templates';
import { quickPickLambda } from './utils/quickPickLambda';
import { ext } from './extensionGlobals';
import { IAWSTreeProvider } from './aws-tree-provider';
import { ILambdaNode } from './commands/models/lambda';
import { listLambdas } from './commands/lambdas/listLambdas';

export class LambdaExplorerProvider implements vscode.TreeDataProvider<ILambdaNode>, IAWSTreeProvider {
    private _onDidChangeTreeData: vscode.EventEmitter<ILambdaNode | undefined> = new vscode.EventEmitter<ILambdaNode | undefined>();
    readonly onDidChangeTreeData: vscode.Event<ILambdaNode | undefined> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {
        console.log(process.env);
        this.context.subscriptions.push(
            vscode.commands.registerCommand('lambdaExplorer.invoke', this.invoke),
            vscode.commands.registerCommand('lambdaExplorer.getConfig', this.getConfig),
            vscode.commands.registerCommand('lambdaExplorer.getPolicy', this.getPolicy)
        );
    }


    getTreeItem(element: ILambdaNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element.getTreeItem();
    }
    getChildren(lambda?: ILambdaNode): vscode.ProviderResult<any[]> {
        if (lambda) {
            console.log(lambda);
            return lambda.getChildren();
        }
        console.log("No lambda found..");
        return listLambdas();
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    // private async reconfigureRegion(configureRegion: Function) {
    //     this.lambdaClient = await configureRegion('lambda') as AWS.Lambda;
    //     await vscode.commands.executeCommand('lambdaExplorer.refresh');
    // }

    private async invoke(element: ILambdaNode) {
        const view = vscode.window.createWebviewPanel('html', `Invoked ${element.lambda.FunctionName}`, -1);
        try {
            const baseTemplateFn = _.template(Templates.BaseTemplate);
            view.webview.html = baseTemplateFn({ content: `<h1>Loading...</h1>` });
            const funcResponse = await ext.lambdaClient.invoke({ FunctionName: element.lambda.FunctionArn!, LogType: 'Tail' }).promise();
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

    private async getConfig(element: ILambdaNode) {
        const view = vscode.window.createWebviewPanel('html', `Get config for ${element.lambda.FunctionName}`, -1);
        try {
            const baseTemplateFn = _.template(Templates.BaseTemplate);
            view.webview.html = baseTemplateFn({ content: `<h1>Loading...</h1>` });
            const funcResponse = await ext.lambdaClient.getFunctionConfiguration({
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

    private async getPolicy(element?: ILambdaNode) {
        let lambda: ILambdaNode;
        try {
            if (element && element.id) {
                console.log('found an element to work with...');
                lambda = element;
            } else {
                console.log('need to prompt for lambda');
                const lambdas = await listLambdas();
                const selection = await quickPickLambda(lambdas);
                if (selection && selection.id) {
                    lambda = selection;
                } else {
                    throw new Error('No lambda found.');
                }
            }
            const view = vscode.window.createWebviewPanel('html', `Getting policy for ${lambda.lambda.FunctionName}`, -1);
            const baseTemplateFn = _.template(Templates.BaseTemplate);
            view.webview.html = baseTemplateFn({ content: `<h1>Loading...</h1>` });
            const funcResponse = await ext.lambdaClient.getPolicy({ FunctionName: lambda.lambda.FunctionName! }).promise();
            const getPolicyTemplateFn = _.template(Templates.GetPolicyTemplate);
            console.log("Logging...");
            view.webview.html = baseTemplateFn({
                content: getPolicyTemplateFn({
                    FunctionName: lambda.lambda.FunctionName,
                    Policy: funcResponse.Policy!
                })
            });
        }
        catch (err) {
            const ex: AWSError = err;
            console.log(ex.message);
        }
    }
}