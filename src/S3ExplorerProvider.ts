import * as vscode from 'vscode';
import * as AWS from 'aws-sdk';
import { ClientBuilder } from './ClientBuilder';

export interface S3Object {
    readonly id: string;
    readonly s3Client: AWS.S3;
    readonly bucket?: AWS.S3.Bucket;
    readonly object?: AWS.S3.Object;
    getChildren(): vscode.ProviderResult<S3Object[]>;
    getTreeItem(): vscode.TreeItem | Thenable<vscode.TreeItem>;
}

export class S3ExplorerProvider implements vscode.TreeDataProvider<S3Object> {
    s3Client: AWS.S3;
    private _onDidChangeTreeData: vscode.EventEmitter<S3Object | undefined> = new vscode.EventEmitter<S3Object | undefined>();
    readonly onDidChangeTreeData: vscode.Event<S3Object | undefined> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext, s3Client: AWS.S3, builderContext: ClientBuilder) {
        console.log(process.env);
        this.s3Client = s3Client;
        this.context.subscriptions.push(
            // vscode.commands.registerCommand('s3Explorer.getConfig', this.getConfig)
            vscode.commands.registerCommand('s3Explorer.configureRegion', async () => {
                this.s3Client = await builderContext.configureRegion('s3') as AWS.S3;
                this.refresh();
            })
        );
    }


    getTreeItem(element: S3Object): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element.getTreeItem();
    }
    getChildren(s3Object?: S3Object): vscode.ProviderResult<any[]> {
        if (s3Object && s3Object.bucket) {
            console.log(s3Object);
            return s3Object.getChildren();
        }
        console.log("No bucket found..");
        return this.getBuckets();
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    // private async reconfigureRegion() {
    //     this.s3Client = await this.configureRegion('s3') as AWS.S3;
    //     await vscode.commands.executeCommand('s3Explorer.refresh');
    // }

    // private async getConfig(element: S3Object) {
    //     const view = vscode.window.createWebviewPanel('html', `Get config for ${element.lambda.FunctionName}`, -1);
    //     try {
    //         const baseTemplateFn = _.template(Templates.BaseTemplate);
    //         view.webview.html = baseTemplateFn({ content: `<h1>Loading...</h1>` });
    //         const funcResponse = await element.lambdaClient.getFunctionConfiguration({
    //             FunctionName: element.lambda.FunctionName!
    //         }).promise();
    //         const getConfigTemplateFn = _.template(Templates.GetConfigTemplate);
    //         console.log("Logging...");

    //         view.webview.html = baseTemplateFn({
    //             content: getConfigTemplateFn(funcResponse)
    //         });
    //     }
    //     catch (err) {
    //         const ex: AWSError = err;
    //         console.log(ex.message);
    //     }
    // }

    private async getBuckets(): Promise<S3Object[]> {
        const status = vscode.window.setStatusBarMessage('Loading buckets...');
        try {
            const bucketsResponse = await this.s3Client.listBuckets().promise();
            status.dispose();
            const buckets = bucketsResponse.Buckets ? bucketsResponse.Buckets : [];
            return buckets.map(b => {
                const name = b.Name ? b.Name : "";
                return new Bucket(name, b, this.s3Client);
            });
        } catch(e) {
            status.dispose();
            throw e;
        }
    }
}

class Bucket implements S3Object {

    constructor(
        readonly id: string,
        readonly bucket: AWS.S3.Bucket,
        readonly s3Client: AWS.S3
    ) {
    }

    async getChildren(): Promise<S3File[]> {
        const objs = await this.s3Client.listObjectsV2({ Bucket: this.bucket.Name! }).promise();
        return objs.Contents!.map(o => new S3File(o.Key!, o, this.s3Client));
    }

    getTreeItem(): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const treeItem = new vscode.TreeItem(this.id, vscode.TreeItemCollapsibleState.Collapsed);
        return treeItem;
    }
}

class S3File implements S3Object {
    bucket?: AWS.S3.Bucket | undefined;
    getChildren(): vscode.ProviderResult<S3Object[]> {
        return [];
    }
    constructor(readonly id: string, readonly object: AWS.S3.Object, readonly s3Client: AWS.S3) { }

    getTreeItem(): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const treeItem = new vscode.TreeItem(this.id, vscode.TreeItemCollapsibleState.None);
        return treeItem;
    }


} 