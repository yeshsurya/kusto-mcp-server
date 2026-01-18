import type { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare const kustoSchemaTool: Tool;
export interface KustoSchemaParams {
    scope: 'databases' | 'tables' | 'table' | 'functions';
    tableName?: string;
    connectionName?: string;
    database?: string;
}
export declare function handleKustoSchema(params: KustoSchemaParams): Promise<string>;
//# sourceMappingURL=kusto-schema.d.ts.map