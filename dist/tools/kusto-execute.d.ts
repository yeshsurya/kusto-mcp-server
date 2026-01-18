import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { type AuthMethod } from '../config/connections.js';
export declare const kustoExecuteTool: Tool;
export interface KustoExecuteParams {
    commands: string[];
    connectionName?: string;
    connectionString?: string;
    database?: string;
    authMethod?: AuthMethod;
    managedIdentityId?: string;
    timeout?: number;
    quitOnError?: boolean;
    format?: 'json' | 'table' | 'raw';
}
export declare function handleKustoExecute(params: KustoExecuteParams): Promise<string>;
//# sourceMappingURL=kusto-execute.d.ts.map