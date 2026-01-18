import type { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare const kustoHelpTool: Tool;
export interface KustoHelpParams {
    verbose?: boolean;
    category?: 'auth' | 'execution' | 'output' | 'security' | 'all';
}
export declare function handleKustoHelp(params: KustoHelpParams): Promise<string>;
//# sourceMappingURL=kusto-help.d.ts.map