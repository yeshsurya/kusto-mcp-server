import type { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare const kustoQueryTool: Tool;
export interface KustoQueryParams {
    query: string;
    connectionName?: string;
    database?: string;
    maxRows?: number;
    timeout?: number;
    format?: 'json' | 'table' | 'raw';
}
export declare function handleKustoQuery(params: KustoQueryParams): Promise<string>;
//# sourceMappingURL=kusto-query.d.ts.map