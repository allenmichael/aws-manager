import { ext } from "../../extensionGlobals";
import { LambdaNode } from '../models/lambda';
import * as vscode from 'vscode';

export async function listLambdas() {
    const status = vscode.window.setStatusBarMessage('Loading lambdas...');
    try {
        const lambdas = await ext.lambdaClient.listFunctions().promise();
        status.dispose();
        const functions = lambdas.Functions ? lambdas.Functions : [];
        return functions.map(l => {
            const name = l.FunctionName ? l.FunctionName : "";
            return new LambdaNode(name, l);
        });
    } catch (e) {
        status.dispose();
        console.log(e);
        throw e;
    }
}