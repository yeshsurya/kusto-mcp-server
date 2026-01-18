import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { type AuthMethod } from '../config/connections.js';
export declare const kustoConnectionAddTool: Tool;
export declare const kustoConnectionListTool: Tool;
export declare const kustoConnectionTestTool: Tool;
export declare const kustoConnectionRemoveTool: Tool;
export declare const kustoConnectionSetDefaultTool: Tool;
export interface ConnectionAddParams {
    name: string;
    cluster: string;
    database: string;
    authMethod?: AuthMethod;
    managedIdentityId?: string;
    isDefault?: boolean;
}
export interface ConnectionTestParams {
    connectionName?: string;
}
export interface ConnectionRemoveParams {
    name: string;
}
export interface ConnectionSetDefaultParams {
    name: string;
}
export declare function handleConnectionAdd(params: ConnectionAddParams): Promise<string>;
export declare function handleConnectionList(): Promise<string>;
export declare function handleConnectionTest(params: ConnectionTestParams): Promise<string>;
export declare function handleConnectionRemove(params: ConnectionRemoveParams): Promise<string>;
export declare function handleConnectionSetDefault(params: ConnectionSetDefaultParams): Promise<string>;
//# sourceMappingURL=kusto-connection.d.ts.map