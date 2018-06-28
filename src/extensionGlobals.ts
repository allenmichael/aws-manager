import { ExtensionContext, OutputChannel } from "vscode";
import { AWSClientBuilder } from "./aws-client-builder";
import { IAWSTreeProvider } from "./aws-tree-provider";

/**
 * Namespace for common variables used globally in the extension. 
 * All variables here must be initialized in the activate() method of extension.ts
 */
export namespace ext {
    export let context: ExtensionContext;
    export let outputChannel: OutputChannel;
    export let trees: IAWSTreeProvider[];
    export let clientBuilder: AWSClientBuilder;
    export let lambdaClient: AWS.Lambda;
    export let s3Client: AWS.S3;
}
