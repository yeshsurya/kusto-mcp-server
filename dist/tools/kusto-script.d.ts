import type { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare const kustoScriptTool: Tool;
export interface KustoScriptParams {
    scriptPath: string;
    connectionName?: string;
    database?: string;
    multiLine?: boolean;
    quitOnError?: boolean;
    timeout?: number;
    format?: 'json' | 'table' | 'raw';
}
export declare function handleKustoScript(params: KustoScriptParams): Promise<string>;
//# sourceMappingURL=kusto-script.d.ts.map