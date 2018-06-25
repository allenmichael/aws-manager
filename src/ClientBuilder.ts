import * as AWS from 'aws-sdk';
import * as vscode from 'vscode';

export class ClientBuilder {
    region = "";
    constructor() {
        this.region = AWS.config.region ? AWS.config.region : "";
    }

    async build(serviceName: string): Promise<AWS.Service> {
        console.log('building...');
        if (this.region) {
            return this.selectService(serviceName, this.region);
        } else {
            this.region = await this.promptForRegion();
        }
        return this.selectService(serviceName, this.region);
    }

    private selectService(serviceName: string, region: string): AWS.Service {
        switch(serviceName.toLowerCase()) {
            case 'lambda': return new AWS.Lambda({region});
            case 's3': return new AWS.S3({region});
            default: throw new Error('Unrecognized service');
        }
    }

    async configureRegion(serviceName: string): Promise<AWS.Service> {
        this.region = await this.promptForRegion();
        return await this.selectService(serviceName, this.region);
    }

    private async promptForRegion(): Promise<string> {
        const input = await vscode.window.showInputBox({
            value: 'us-east-1',
            prompt: 'Please enter an AWS region',
        });
        return input ? input : "";
    }
}