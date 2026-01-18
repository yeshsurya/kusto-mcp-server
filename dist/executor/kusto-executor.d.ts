import type { KustoConnection } from '../config/connections.js';
import type { KustoQueryOptions, KustoExecutionResult } from '../parser/option-types.js';
export interface ExecuteOptions extends KustoQueryOptions {
    connection?: KustoConnection;
    connectionString?: string;
    database?: string;
}
export interface ExecuteCommandOptions extends ExecuteOptions {
    commands: string[];
}
export interface ExecuteScriptOptions extends ExecuteOptions {
    scriptPath: string;
}
export declare function executeQuery(query: string, options: ExecuteOptions): Promise<KustoExecutionResult>;
export declare function executeCommands(options: ExecuteCommandOptions): Promise<KustoExecutionResult>;
export declare function executeScript(options: ExecuteScriptOptions): Promise<KustoExecutionResult>;
export declare function getCliHelp(): Promise<string>;
export declare function testConnection(options: ExecuteOptions): Promise<{
    success: boolean;
    message: string;
    latencyMs?: number;
}>;
//# sourceMappingURL=kusto-executor.d.ts.map