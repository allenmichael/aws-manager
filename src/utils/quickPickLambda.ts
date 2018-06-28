import * as vscode from 'vscode';
import { ILambdaNode } from '../commands/models/lambda';


export async function quickPickLambda(lambdas: ILambdaNode[]): Promise<ILambdaNode | undefined> {
    try {
        if (!lambdas || lambdas.length === 0) {
            vscode.window.showInformationMessage('There are no lambdas in this region.');
        } else {
            const lambdaNames = lambdas.map(l => l.label);
            const name = await vscode.window.showQuickPick(lambdaNames, { placeHolder: 'Choose a lambda' });
            const found = lambdas.filter(l => l.label === name);
            return (found.length > 0) ? found[0] : undefined;
        }
        throw new Error('No lambdas to work with.');
    } catch (error) {
        vscode.window.showErrorMessage('Unable to connect to AWS.');
    }

}